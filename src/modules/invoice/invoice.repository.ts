import {
  PrismaClient,
  Prisma,
  TransactionType,
  InvoiceType,
  SourceType,
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
import { InvoiceCalculator, transformLineItems } from './invoice.utils';
import { transformPartyData } from '../party/party.service';
export class InvoiceRepository {
  private prisma: PrismaClient;
  private readonly include = {
    challans: {
      orderBy: [
        { date: 'asc' as Prisma.SortOrder },
        { createdAt: 'asc' as Prisma.SortOrder },
      ],
    },
    party: true,
    challanTemplate: true,
    organization: true,
  };

  constructor() {
    this.prisma = new PrismaClient();
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
      partyDetails: data.partyDetails as unknown as Prisma.JsonObject,
      orgDetails: data.orgDetails as unknown as Prisma.JsonObject,
      includeTax: data.includeTax,
      roundOff: data.roundOff,
      lineItems: calculatedLineItems as unknown as Prisma.JsonObject,
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
      include: this.include,
    });

    return {
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    };
  }

  async findAll(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
    startDate?: Date,
    endDate?: Date,
    partyId?: string,
  ) {
    const results = await this.prisma.invoice.findMany({
      where: {
        orgId,
        ...(transactionType && { transactionType }),
        ...(invoiceType && { invoiceType }),
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
      include: this.include,
    });

    return results.map((result) => ({
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    }));
  }

  async findById(id: string, orgId: string) {
    const result = await this.prisma.invoice.findFirst({
      where: {
        id,
        orgId,
      },
      include: this.include,
    });

    if (!result) return null;

    return {
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    };
  }

  async findByIds(ids: string[], orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        id: { in: ids },
        orgId,
      },
      include: this.include,
    });

    return results;
  }

  async findByPartyId(partyId: string, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        partyId,
        orgId,
      },
      include: this.include,
    });

    return results.map((result) => ({
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
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

      const existingLineItems =
        existingInvoice?.lineItems as unknown as ILineItem[];
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
            isService: updateItem.isService ?? existingItem.isService,
            isInterState: updateItem.isInterState ?? existingItem.isInterState,
            uom: updateItem.uom ?? existingItem.uom,
            uomId: updateItem.uomId ?? existingItem.uomId,
            description: updateItem.description ?? existingItem.description,
            rate: updateItem.rate ?? existingItem.rate,
            quantity: updateItem.quantity ?? existingItem.quantity,
            gstRate: updateItem.gstRate ?? existingItem.gstRate,
            cessAdValoremRate:
              updateItem.cessAdValoremRate ?? existingItem.cessAdValoremRate,
            cessSpecificRate:
              updateItem.cessSpecificRate ?? existingItem.cessSpecificRate,
            stateCessAdValoremRate:
              updateItem.stateCessAdValoremRate ??
              existingItem.stateCessAdValoremRate,
            stateCessSpecificRate:
              updateItem.stateCessSpecificRate ??
              existingItem.stateCessSpecificRate,
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
      lineItems: lineItems
        ? (lineItems as unknown as Prisma.JsonObject)
        : undefined,
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
      include: this.include,
    });

    return {
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    };
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
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    };
  }

  async findByTransactionType(transactionType: TransactionType, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        transactionType,
        orgId,
      },
      include: {
        challans: {
          orderBy: [
            { date: 'asc' as Prisma.SortOrder },
            { createdAt: 'asc' as Prisma.SortOrder },
          ],
        },
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
    }));
  }

  async findByInvoiceType(invoiceType: InvoiceType, orgId: string) {
    const results = await this.prisma.invoice.findMany({
      where: {
        invoiceType,
        orgId,
      },
      include: {
        challans: {
          orderBy: [
            { date: 'asc' as Prisma.SortOrder },
            { createdAt: 'asc' as Prisma.SortOrder },
          ],
        },
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
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
        challans: {
          orderBy: [
            { date: 'asc' as Prisma.SortOrder },
            { createdAt: 'asc' as Prisma.SortOrder },
          ],
        },
      },
    });

    return results.map((result) => ({
      ...result,
      lineItems: transformLineItems(result.lineItems as unknown as any[]),
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
              lineItems: transformLineItems(
                result.lineItems as unknown as any[],
              ),
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
