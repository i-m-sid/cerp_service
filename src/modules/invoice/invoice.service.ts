import {
  ICreateInvoice,
  ICreateLineItem,
  ILineItemChallan,
  IUpdateInvoice,
  IBulkUpdateInvoices,
  IUpdateLineItem,
} from './invoice.interface';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceType, PrismaClient, TransactionType } from '@prisma/client';
import { ChallanService } from '../challan/challan.service';
import { OrganizationService } from '../organization/organization.service';
import { ChallanTemplateService } from '../challan-template/challan-template.service';
import {
  getInvoiceNumericPart,
  getInvoiceConfigCurrentNumber,
  updateInvoiceConfigCurrentNumber,
} from './invoice.utils';
import { IChallan, IUpdateChallan } from '../challan/challan.interface';

export class InvoiceService {
  private repository: InvoiceRepository;
  private prisma: PrismaClient;
  private challanTemplateService: ChallanTemplateService;
  private challanService: ChallanService;
  private organizationService: OrganizationService;
  constructor() {
    this.repository = new InvoiceRepository();
    this.prisma = new PrismaClient();
    this.challanTemplateService = new ChallanTemplateService();
    this.challanService = new ChallanService();
    this.organizationService = new OrganizationService();
  }

  async create(data: ICreateInvoice, userId: string) {
    try {
      await this.updateChallansByLineItems(
        data.challanTemplateId,
        data.orgId,
        data.invoiceType ?? InvoiceType.INVOICE,
        data.lineItems,
      );
      const invoice = await this.repository.create(data);
      await this.updateInvoiceConfig(
        invoice.invoiceNumber,
        invoice.invoiceType,
        invoice.orgId,
        userId,
      );
      return invoice;
    } catch (error) {
      // Rethrow the error to be handled by the controller
      throw error;
    }
  }

  async findAll(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
    startDate?: Date,
    endDate?: Date,
    partyId?: string,
  ) {
    return this.repository.findAll(
      orgId,
      transactionType,
      invoiceType,
      startDate,
      endDate,
      partyId,
    );
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByPartyId(partyId: string, orgId: string) {
    return this.repository.findByPartyId(partyId, orgId);
  }

  async update(data: IUpdateInvoice, userId: string) {
    await this.updateChallansByLineItems(
      data.challanTemplateId ?? '',
      data.orgId,
      data.invoiceType ?? InvoiceType.INVOICE,
      data.lineItems ?? [],
    );
    const invoice = await this.repository.update(data);
    await this.updateInvoiceConfig(
      invoice.invoiceNumber,
      invoice.invoiceType,
      invoice.orgId,
      userId,
    );
    return invoice;
  }

  async bulkUpdate(data: IBulkUpdateInvoices) {
    const { invoices } = data;

    if (!invoices || !Array.isArray(invoices) || invoices.length === 0) {
      throw new Error('No invoices provided for bulk update');
    }

    return this.repository.bulkUpdate(invoices);
  }

  async delete(id: string, orgId: string) {
    const invoice = await this.repository.findById(id, orgId);
    if (invoice?.challans) {
      await this.resetChallanStatus(
        invoice.challanTemplateId,
        orgId,
        invoice.challans.map((challan) => challan.id),
      );
    }
    return this.repository.delete(id, orgId);
  }
  async findByTransactionType(transactionType: TransactionType, orgId: string) {
    return this.repository.findByTransactionType(transactionType, orgId);
  }

  async findByInvoiceType(invoiceType: InvoiceType, orgId: string) {
    return this.repository.findByInvoiceType(invoiceType, orgId);
  }

  async findByTypes(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
  ) {
    return this.repository.findByTypes(orgId, transactionType, invoiceType);
  }

  async bulkDelete(ids: string[], orgId: string) {
    for (const id of ids) {
      const invoice = await this.repository.findById(id, orgId);
      if (invoice?.challans) {
        await this.resetChallanStatus(
          invoice.challanTemplateId,
          orgId,
          invoice.challans.map((challan) => challan.id),
        );
      }
    }
    return this.repository.bulkDelete(ids, orgId);
  }

  async resetChallanStatus(
    challanTemplateId: string,
    orgId: string,
    challanIds: string[],
  ) {
    const challans = await this.challanService.findManyByIds(challanIds, orgId);
    const org = await this.organizationService.findById(orgId);
    const statusId = org?.config?.challanDefaultStatus?.[challanTemplateId];
    for (const challan of challans) {
      if (statusId) {
        challan.statusId = statusId;
      }
    }
    if (challans.length > 0) {
      await this.challanService.bulkUpdate({
        challans: challans as IUpdateChallan[],
      }, orgId);
    }
  }

  async updateInvoiceConfig(
    invoiceNumber: string,
    invoiceType: InvoiceType,
    orgId: string,
    userId: string,
  ) {
    try {
      const org = await this.organizationService.findById(orgId);
      if (org?.config) {
        const documentNumber = getInvoiceNumericPart(
          invoiceNumber,
          invoiceType,
          org?.config,
        );
        if (documentNumber) {
          const currentNumber = getInvoiceConfigCurrentNumber(
            invoiceType,
            org?.config,
          );
          const updatedConfig = updateInvoiceConfigCurrentNumber(
            invoiceType,
            Math.max(
              parseInt(currentNumber),
              parseInt(documentNumber),
            ).toString(),
            org?.config!,
          );
          await this.organizationService.update(
            { id: orgId, config: updatedConfig },
            userId,
          );
        }
      }
    } catch (error) {
      console.error('Error updating invoice config:', error);
    }
  }

  async updateChallansByLineItems(
    challanTemplateId: string,
    orgId: string,
    invoiceType: InvoiceType,
    lineItems: ICreateLineItem[] | IUpdateLineItem[],
  ) {
    try {
      const challanTemplate = await this.challanTemplateService.findById(
        challanTemplateId,
        orgId,
      );
      const org = await this.organizationService.findById(orgId);
      const statusId =
        org?.config?.invoiceTypeToChallanStatus?.[challanTemplateId]?.[
          invoiceType
        ];
      const fieldSchema = challanTemplate?.fieldSchema;
      if (fieldSchema) {
        const rateField = fieldSchema!.find(
          (field) => field.invoiceField === 'rate',
        );
        const cgstPercentageField = fieldSchema!.find(
          (field) => field.invoiceField === 'cgst',
        );
        const sgstPercentageField = fieldSchema!.find(
          (field) => field.invoiceField === 'sgst',
        );
        const igstPercentageField = fieldSchema!.find(
          (field) => field.invoiceField === 'igst',
        );

        const lineItemChallans: ILineItemChallan[] = [];

        for (const lineItem of lineItems) {
          const challanIds = lineItem.challanIds ?? [];
          const challans = await this.challanService.findManyByIds(challanIds, orgId);
          lineItemChallans.push({
            rate: lineItem.rate,
            quantity: lineItem.quantity,
            cgstPercentage: lineItem.cgstPercentage,
            sgstPercentage: lineItem.sgstPercentage,
            igstPercentage: lineItem.igstPercentage,
            challans: challans.map((challan) => ({
              ...challan,
              statusId:
                challan.statusId === null ? undefined : challan.statusId,
            })) as IChallan[],
          });
        }

        for (const lineItemChallan of lineItemChallans) {
          for (const challan of lineItemChallan.challans) {
            if (challan && challan.customFields) {
              if (
                invoiceType == InvoiceType.INVOICE ||
                invoiceType == InvoiceType.PRO_FORMA
              ) {
                if (statusId) {
                  challan.statusId = statusId;
                }
              }

              if (rateField && lineItemChallan.rate) {
                challan.customFields[rateField!.id] = {
                  ...challan.customFields[rateField!.id],
                  value: lineItemChallan.rate.toString(),
                };
              }
              if (cgstPercentageField && lineItemChallan.cgstPercentage) {
                challan.customFields[cgstPercentageField!.id] = {
                  ...challan.customFields[cgstPercentageField!.id],
                  value: lineItemChallan.cgstPercentage.toString(),
                };
              }
              if (sgstPercentageField && lineItemChallan.sgstPercentage) {
                challan.customFields[sgstPercentageField!.id] = {
                  ...challan.customFields[sgstPercentageField!.id],
                  value: lineItemChallan.sgstPercentage.toString(),
                };
              }
              if (igstPercentageField && lineItemChallan.igstPercentage) {
                challan.customFields[igstPercentageField!.id] = {
                  ...challan.customFields[igstPercentageField!.id],
                  value: lineItemChallan.igstPercentage.toString(),
                };
              }
            }
          }
          if (lineItemChallan.challans.length > 0) {
            await this.challanService.bulkUpdate({
              challans: lineItemChallan.challans as IUpdateChallan[],
            }, orgId);
          }
        }
      }
    } catch (error) {
      console.error('Error updating challans by line items:', error);
      throw new Error('Error updating challans');
    }
  }
}
