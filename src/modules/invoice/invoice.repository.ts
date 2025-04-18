import {
  PrismaClient,
  Prisma,
  TransactionType,
  InvoiceType,
} from '@prisma/client';
import {
  ICreateInvoice,
  IUpdateInvoice,
  ILineItem,
  ICreateLineItem,
  IUpdateLineItem,
  IPartyDetails,
  IOrgDetails,
} from './invoice.interface';
import { InvoiceCalculator } from './invoice.utils';
import { transformPartyData } from '../party/party.service';
export class InvoiceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private objectToJson(
    obj?: ILineItem[] | ICreateLineItem[] | IUpdateLineItem[],
  ): Prisma.JsonObject | typeof Prisma.JsonNull {
    if (!obj || obj.length === 0) {
      return Prisma.JsonNull;
    }
    return obj as unknown as Prisma.JsonObject;
  }

  private partyDetailsToJson(
    obj?: IPartyDetails | IOrgDetails,
  ): Prisma.JsonObject | typeof Prisma.JsonNull {
    if (!obj) {
      return Prisma.JsonNull;
    }
    return obj as unknown as Prisma.JsonObject;
  }

  private isValidLineItem(item: unknown): item is ILineItem {
    if (!item || typeof item !== 'object') return false;

    const requiredFields = ['item', 'hsnCode', 'uom', 'rate'];
    const hasRequiredFields = requiredFields.every(
      (field) =>
        field in item && item[field as keyof typeof item] !== undefined,
    );

    if (!hasRequiredFields) return false;

    return true;
  }

  private jsonToObject(json?: Prisma.JsonValue | null): ILineItem[] {
    const arr: ILineItem[] = [];
    if (json && Array.isArray(json)) {
      for (const item of json) {
        if (this.isValidLineItem(item)) {
          arr.push(item);
        } else {
          throw new Error(`Invalid line item data: ${JSON.stringify(item)}`);
        }
      }
    }
    return arr;
  }

  async create(data: ICreateInvoice) {
    // Validate challans if provided
    if (data.challanIds && data.challanIds.length > 0) {
      const invalidChallans = await this.validateChallans(data.challanIds);
      if (invalidChallans.length > 0) {
        throw new Error(
          `Some challans are already attached to invoices: ${invalidChallans.join(', ')}`,
        );
      }
    }

    // Calculate line items with totals
    const calculatedLineItems = data.lineItems.map((item) =>
      InvoiceCalculator.calculateLineItem(item, data.includeTax),
    );

    // Calculate invoice totals
    const totals = InvoiceCalculator.calculateInvoiceTotals(
      calculatedLineItems,
      data.roundOff,
      data.includeTax,
    );

    const createData = {
      invoiceNumber: data.invoiceNumber,
      poNumber: data.poNumber,
      date: data.date,
      invoiceType: data.invoiceType,
      transactionType: data.transactionType,
      partyDetails: this.partyDetailsToJson(data.partyDetails),
      orgDetails: this.partyDetailsToJson(data.orgDetails),
      includeTax: data.includeTax,
      roundOff: data.roundOff,
      lineItems: this.objectToJson(calculatedLineItems),
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      ...totals,
      challanTemplate: {
        connect: { id: data.challanTemplateId },
      },
      party: {
        connect: { id: data.partyId },
      },
      organization: {
        connect: { id: data.orgId },
      },
      ...(data.challanIds && {
        challans: {
          connect: data.challanIds.map((id) => ({ id })),
        },
      }),
    };

    const result = await this.prisma.invoice.create({
      data: createData,
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return {
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    };
  }

  async findAll(
    orgId: string,
    transactionType?: TransactionType,
    startDate?: Date,
    endDate?: Date,
    partyId?: string,
  ) {
    const results = await this.prisma.invoice.findMany({
      where: {
        orgId,
        ...(transactionType && { transactionType }),
        ...(partyId && { partyId }),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    }));
  }

  async findById(id: string, orgId: string) {
    const result = await this.prisma.invoice.findFirst({
      where: {
        id,
        orgId,
      },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    if (!result) return null;

    return {
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    };
  }

  async findByPartyId(partyId: string, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        partyId,
        orgId,
      },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    }));
  }

  async update(data: IUpdateInvoice) {
    const { id, challanIds, orgId, lineItems, ...updateFields } = data;

    // Calculate totals if line items are being updated
    let totals = {};
    if (lineItems) {
      // First get the existing line items to merge with updates
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { id },
        select: { lineItems: true, includeTax: true },
      });

      const existingLineItems = this.jsonToObject(existingInvoice?.lineItems);
      const includeTax =
        updateFields.includeTax !== undefined
          ? updateFields.includeTax
          : existingInvoice?.includeTax || false;

      // Merge existing items with updates
      const updatedLineItems = existingLineItems.map((existingItem) => {
        const updateItem = lineItems.find(
          (item) => item.id === existingItem.id,
        );
        if (!updateItem) return existingItem;

        // Create a new line item with merged data
        return InvoiceCalculator.calculateLineItem(
          {
            itemId: updateItem.itemId ?? existingItem.itemId,
            item: updateItem.item ?? existingItem.item,
            hsnCode: updateItem.hsnCode ?? existingItem.hsnCode,
            uom: updateItem.uom ?? existingItem.uom,
            description: updateItem.description ?? existingItem.description,
            rate: updateItem.rate ?? existingItem.rate,
            quantity: updateItem.quantity ?? existingItem.quantity,
            cgstPercentage:
              updateItem.cgstPercentage ?? existingItem.cgstPercentage,
            sgstPercentage:
              updateItem.sgstPercentage ?? existingItem.sgstPercentage,
            igstPercentage:
              updateItem.igstPercentage ?? existingItem.igstPercentage,
            fixedDiscount:
              updateItem.fixedDiscount ?? existingItem.fixedDiscount,
            percentageDiscount:
              updateItem.percentageDiscount ?? existingItem.percentageDiscount,
            challanIds: updateItem.challanIds ?? existingItem.challanIds,
          },
          includeTax,
        );
      });

      totals = InvoiceCalculator.calculateInvoiceTotals(
        updatedLineItems,
        updateFields.roundOff ?? false,
        includeTax,
      );
    }

    const updateData = {
      invoiceNumber: updateFields.invoiceNumber,
      poNumber: updateFields.poNumber,
      date: updateFields.date,
      invoiceType: updateFields.invoiceType,
      transactionType: updateFields.transactionType,
      includeTax: updateFields.includeTax,
      roundOff: updateFields.roundOff,
      notes: updateFields.notes,
      termsAndConditions: updateFields.termsAndConditions,
      ...totals, // Add calculated totals if line items were updated
      lineItems: lineItems ? this.objectToJson(lineItems) : undefined,
      ...(updateFields.challanTemplateId && {
        challanTemplate: {
          connect: { id: updateFields.challanTemplateId },
        },
      }),
      ...(updateFields.partyId && {
        party: {
          connect: { id: updateFields.partyId },
        },
      }),
      ...(challanIds && {
        challans: {
          set: [],
          connect: challanIds.map((id) => ({ id })),
        },
      }),
    };

    const result = await this.prisma.invoice.update({
      where: {
        id,
        orgId,
      },
      data: updateData,
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return {
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
    };
  }

  async bulkUpdate(invoices: IUpdateInvoice[]) {
    const updatePromises = invoices.map(async (invoice) => {
      try {
        const updatedInvoice = await this.update(invoice);
        return { success: true, data: updatedInvoice, id: invoice.id };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error',
          id: invoice.id,
        };
      }
    });

    return Promise.all(updatePromises);
  }

  async delete(id: string, orgId: string) {
    const result = await this.prisma.invoice.delete({
      where: {
        id,
        orgId,
      },
    });

    return {
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
    };
  }

  async findByTransactionType(transactionType: TransactionType, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        transactionType,
        orgId,
      },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    }));
  }

  async findByInvoiceType(invoiceType: InvoiceType, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        invoiceType,
        orgId,
      },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    }));
  }

  async findByTypes(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
  ) {
    const where: any = { orgId };
    if (transactionType) where.transactionType = transactionType;
    if (invoiceType) where.invoiceType = invoiceType;

    const results = await this.prisma.invoice.findMany({
      where,
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
      party: transformPartyData(result.party),
    }));
  }

  async bulkDelete(ids: string[], orgId: string) {
    // Using transaction for data consistency
    return this.prisma.$transaction(async (tx) => {
      const deletePromises = ids.map(async (id) => {
        try {
          const result = await tx.invoice.delete({
            where: {
              id,
              orgId,
            },
          });

          return {
            success: true,
            data: {
              ...result,
              lineItems: this.jsonToObject(result.lineItems),
            },
            id,
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Unknown error',
            id,
          };
        }
      });

      return Promise.all(deletePromises);
    });
  }

  /**
   * Validates if challans are available (not attached to any invoice)
   * @param challanIds Array of challan IDs to validate
   * @returns Array of IDs that are already attached to invoices (invalid)
   */
  private async validateChallans(challanIds: string[]): Promise<string[]> {
    const existingChallans = await this.prisma.challan.findMany({
      where: {
        id: { in: challanIds },
        invoiceId: { not: null },
      },
      select: {
        id: true,
      },
    });

    return existingChallans.map((challan) => challan.id);
  }
}
