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
} from './invoice.interface';
import { InvoiceCalculator } from './invoice.utils';

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

  private isValidLineItem(item: unknown): item is ILineItem {
    if (!item || typeof item !== 'object') return false;

    const requiredFields = ['item', 'hsnCode', 'uom', 'description', 'rate'];
    const hasRequiredFields = requiredFields.every(
      (field) =>
        field in item && item[field as keyof typeof item] !== undefined,
    );

    if (!hasRequiredFields) return false;

    const typedItem = item as Record<string, unknown>;

    return (
      typeof typedItem.item === 'string' &&
      typeof typedItem.hsnCode === 'string' &&
      typeof typedItem.uom === 'string' &&
      typeof typedItem.description === 'string' &&
      typeof typedItem.rate === 'number' &&
      (typedItem.cgstPercentage === undefined ||
        typeof typedItem.cgstPercentage === 'number') &&
      (typedItem.sgstPercentage === undefined ||
        typeof typedItem.sgstPercentage === 'number') &&
      (typedItem.igstPercentage === undefined ||
        typeof typedItem.igstPercentage === 'number') &&
      (typedItem.discount === undefined ||
        typeof typedItem.discount === 'number') &&
      (typedItem.discountType === undefined ||
        typeof typedItem.discountType === 'string') &&
      (typedItem.quantity === undefined ||
        typeof typedItem.quantity === 'number')
    );
  }

  private jsonToObject(json?: Prisma.JsonValue | null): ILineItem[] {
    const arr: ILineItem[] = [];
    if (json && Array.isArray(json)) {
      for (const item of json) {
        if (this.isValidLineItem(item)) {
          arr.push(item);
        } else {
          console.warn('Skipping invalid line item data:', item);
        }
      }
    }
    return arr;
  }

  async create(data: ICreateInvoice) {
    // Calculate line items with totals
    const calculatedLineItems = data.lineItems.map((item) =>
      InvoiceCalculator.calculateLineItem(item),
    );

    // Calculate invoice totals
    const totals = InvoiceCalculator.calculateInvoiceTotals(
      calculatedLineItems,
      data.roundOff,
    );

    const createData = {
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      invoiceType: data.invoiceType,
      transactionType: data.transactionType,
      includeTax: data.includeTax,
      roundOff: data.roundOff,
      lineItems: this.objectToJson(calculatedLineItems),
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      ...totals, // Add all calculated totals
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
    };
  }

  async findAll(orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: { orgId },
      include: {
        party: true,
        challans: true,
        organization: true,
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: this.jsonToObject(result.lineItems),
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
        select: { lineItems: true },
      });

      const existingLineItems = this.jsonToObject(existingInvoice?.lineItems);

      // Merge existing items with updates
      const updatedLineItems = existingLineItems.map((existingItem) => {
        const updateItem = lineItems.find(
          (item) => item.id === existingItem.id,
        );
        if (!updateItem) return existingItem;

        // Create a new line item with merged data
        return InvoiceCalculator.calculateLineItem({
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
          discount: updateItem.discount ?? existingItem.discount,
          discountType: updateItem.discountType ?? existingItem.discountType,
        });
      });

      totals = InvoiceCalculator.calculateInvoiceTotals(
        updatedLineItems,
        updateFields.roundOff ?? false,
      );
    }

    const updateData = {
      invoiceNumber: updateFields.invoiceNumber,
      date: updateFields.date,
      invoiceType: updateFields.invoiceType,
      transactionType: updateFields.transactionType,
      includeTax: updateFields.includeTax,
      roundOff: updateFields.roundOff,
      notes: updateFields.notes,
      termsAndConditions: updateFields.termsAndConditions,
      ...totals, // Add calculated totals if line items were updated
      lineItems: lineItems ? this.objectToJson(lineItems) : undefined,
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
    }));
  }
}
