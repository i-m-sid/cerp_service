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

  async findByIds(ids: string[], orgId: string) {
    return this.repository.findByIds(ids, orgId);
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
      await this.challanService.bulkUpdate(
        {
          challans: challans as IUpdateChallan[],
        },
        orgId,
      );
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
        const gstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'gst',
        );
        const cgstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'cgst',
        );
        const sgstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'sgst',
        );
        const igstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'igst',
        );
        const cessAdValoremField = fieldSchema!.find(
          (field) => field.invoiceField === 'cessAdValorem',
        );
        const cessSpecificField = fieldSchema!.find(
          (field) => field.invoiceField === 'cessSpecific',
        );
        const stateCessAdValoremField = fieldSchema!.find(
          (field) => field.invoiceField === 'stateCessAdValorem',
        );
        const stateCessSpecificField = fieldSchema!.find(
          (field) => field.invoiceField === 'stateCessSpecific',
        );
        const fixedDiscountField = fieldSchema!.find(
          (field) => field.invoiceField === 'fixedDiscount',
        );
        const percentageDiscountField = fieldSchema!.find(
          (field) => field.invoiceField === 'percentageDiscount',
        );

        const lineItemChallans: ILineItemChallan[] = [];

        for (const lineItem of lineItems) {
          const challanIds = lineItem.challanIds ?? [];
          const challans = await this.challanService.findManyByIds(
            challanIds,
            orgId,
          );
          lineItemChallans.push({
            rate: lineItem.rate,
            quantity: lineItem.quantity,
            gstRate: lineItem.gstRate,
            cessAdValoremRate: lineItem.cessAdValoremRate,
            cessSpecificRate: lineItem.cessSpecificRate,
            stateCessAdValoremRate: lineItem.stateCessAdValoremRate,
            stateCessSpecificRate: lineItem.stateCessSpecificRate,
            fixedDiscount: lineItem.fixedDiscount,
            percentageDiscount: lineItem.percentageDiscount,
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
              if (gstRateField && lineItemChallan.gstRate) {
                challan.customFields[gstRateField!.id] = {
                  ...challan.customFields[gstRateField!.id],
                  value: (lineItemChallan.gstRate / 2).toString(),
                };
              }
              if (cgstRateField && lineItemChallan.gstRate) {
                challan.customFields[cgstRateField!.id] = {
                  ...challan.customFields[cgstRateField!.id],
                  value: (!lineItemChallan.isInterState
                    ? lineItemChallan.gstRate / 2
                    : 0
                  ).toString(),
                };
              }
              if (sgstRateField && lineItemChallan.gstRate) {
                challan.customFields[sgstRateField!.id] = {
                  ...challan.customFields[sgstRateField!.id],
                  value: (!lineItemChallan.isInterState
                    ? lineItemChallan.gstRate / 2
                    : 0
                  ).toString(),
                };
              }
              if (igstRateField && lineItemChallan.gstRate) {
                challan.customFields[igstRateField!.id] = {
                  ...challan.customFields[igstRateField!.id],
                  value: (lineItemChallan.isInterState
                    ? lineItemChallan.gstRate
                    : 0
                  ).toString(),
                };
              }
              if (cessAdValoremField && lineItemChallan.cessAdValoremRate) {
                challan.customFields[cessAdValoremField!.id] = {
                  ...challan.customFields[cessAdValoremField!.id],
                  value: lineItemChallan.cessAdValoremRate.toString(),
                };
              }
              if (cessSpecificField && lineItemChallan.cessSpecificRate) {
                challan.customFields[cessSpecificField!.id] = {
                  ...challan.customFields[cessSpecificField!.id],
                  value: lineItemChallan.cessSpecificRate.toString(),
                };
              }
              if (
                stateCessAdValoremField &&
                lineItemChallan.stateCessAdValoremRate
              ) {
                challan.customFields[stateCessAdValoremField!.id] = {
                  ...challan.customFields[stateCessAdValoremField!.id],
                  value: lineItemChallan.stateCessAdValoremRate.toString(),
                };
              }
              if (
                stateCessSpecificField &&
                lineItemChallan.stateCessSpecificRate
              ) {
                challan.customFields[stateCessSpecificField!.id] = {
                  ...challan.customFields[stateCessSpecificField!.id],
                  value: lineItemChallan.stateCessSpecificRate.toString(),
                };
              }
              if (fixedDiscountField && lineItemChallan.fixedDiscount) {
                challan.customFields[fixedDiscountField!.id] = {
                  ...challan.customFields[fixedDiscountField!.id],
                  value: lineItemChallan.fixedDiscount.toString(),
                };
              }
              if (
                percentageDiscountField &&
                lineItemChallan.percentageDiscount
              ) {
                challan.customFields[percentageDiscountField!.id] = {
                  ...challan.customFields[percentageDiscountField!.id],
                  value: lineItemChallan.percentageDiscount.toString(),
                };
              }
            }
          }
          if (lineItemChallan.challans.length > 0) {
            await this.challanService.bulkUpdate(
              {
                challans: lineItemChallan.challans as IUpdateChallan[],
              },
              orgId,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error updating challans by line items:', error);
      throw new Error('Error updating challans');
    }
  }
}
