import { ChallanTemplateService } from '../challan-template/challan-template.service';
import { ChallanService } from '../challan/challan.service';
import {
  ICreateInvoice,
  IUpdateInvoice,
  IBulkUpdateInvoices,
  ICreateLineItem,
  IUpdateLineItem,
  ILineItemChallan,
} from './invoice.interface';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceType, TransactionType, PrismaClient } from '@prisma/client';
import { IUpdateChallan } from '../challan/challan.interface';
export class InvoiceService {
  private repository: InvoiceRepository;
  private prisma: PrismaClient;
  private challanTemplateService: ChallanTemplateService;
  private challanService: ChallanService;

  constructor() {
    this.repository = new InvoiceRepository();
    this.prisma = new PrismaClient();
    this.challanTemplateService = new ChallanTemplateService();
    this.challanService = new ChallanService();
  }

  async create(data: ICreateInvoice) {
    try {
      await this.updateChallansByLineItems(
        data.challanTemplateId,
        data.orgId,
        data.lineItems,
      );
      return await this.repository.create(data);
    } catch (error) {
      // Rethrow the error to be handled by the controller
      throw error;
    }
  }

  async findAll(
    orgId: string,
    transactionType?: TransactionType,
    startDate?: Date,
    endDate?: Date,
    partyId?: string,
  ) {
    return this.repository.findAll(
      orgId,
      transactionType,
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

  async update(data: IUpdateInvoice) {
    await this.updateChallansByLineItems(
      data.challanTemplateId ?? '',
      data.orgId,
      data.lineItems ?? [],
    );
    return this.repository.update(data);
  }

  async bulkUpdate(data: IBulkUpdateInvoices) {
    const { invoices } = data;

    if (!invoices || !Array.isArray(invoices) || invoices.length === 0) {
      throw new Error('No invoices provided for bulk update');
    }

    return this.repository.bulkUpdate(invoices);
  }

  async delete(id: string, orgId: string) {
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
    return this.repository.bulkDelete(ids, orgId);
  }

  async updateChallansByLineItems(
    challanTemplateId: string,
    orgId: string,
    lineItems: ICreateLineItem[] | IUpdateLineItem[],
  ) {
    try {
      const challanTemplate = await this.challanTemplateService.findById(
        challanTemplateId,
        orgId,
      );
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

        console.log('cgstPercentageField', cgstPercentageField);
        console.log('igstPercentageField', igstPercentageField);

        const lineItemChallans: ILineItemChallan[] = [];

        for (const lineItem of lineItems) {
          const challanIds = lineItem.challanIds ?? [];
          const challans = await this.challanService.findManyByIds(challanIds);
          lineItemChallans.push({
            rate: lineItem.rate,
            quantity: lineItem.quantity,
            cgstPercentage: lineItem.cgstPercentage,
            sgstPercentage: lineItem.sgstPercentage,
            igstPercentage: lineItem.igstPercentage,
            challans: challans,
          });
        }

        for (const lineItemChallan of lineItemChallans) {
          for (const challan of lineItemChallan.challans) {
            if (challan && challan.customFields) {
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
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating challans by line items:', error);
      throw new Error('Error updating challans');
    }
  }
}
