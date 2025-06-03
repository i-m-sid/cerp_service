import { InvoiceType, TransactionType } from '@prisma/client';
import {
  IDocumentConfig,
  IOrganizationConfig,
} from '../organization/organization.interface';
import {
  ICreateLineItem,
  ILineItem,
  IUpdateLineItem,
} from './invoice.interface';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';
export class InvoiceCalculator {
  private static calculateDiscount(
    amount: Decimal,
    fixedDiscount?: Decimal,
    percentageDiscount?: Decimal,
  ): Decimal {
    let totalDiscount = new Decimal(0);

    if (percentageDiscount && percentageDiscount.gt(0)) {
      totalDiscount = totalDiscount.add(
        amount.mul(percentageDiscount).div(100),
      );
    }

    if (fixedDiscount && fixedDiscount.gt(0)) {
      totalDiscount = totalDiscount.add(fixedDiscount);
    }

    return totalDiscount;
  }

  private static calculateRoundOff(amount: Decimal): {
    roundOffAmount: Decimal;
    finalAmount: Decimal;
  } {
    const roundedAmount = amount.round();
    const roundOffAmount = roundedAmount.sub(amount);
    return {
      roundOffAmount,
      finalAmount: roundedAmount,
    };
  }

  static calculateLineItem(
    item: ICreateLineItem,
    includeTax: boolean = true,
  ): ILineItem {
    const quantity = new Decimal(item.quantity);
    const rate = new Decimal(item.rate);
    const baseAmount = rate.mul(quantity);
    const discountAmount = this.calculateDiscount(
      baseAmount,
      new Decimal(item.fixedDiscount),
      new Decimal(item.percentageDiscount),
    );
    const subTotal = baseAmount.sub(discountAmount);

    // Calculate tax amounts - rate never includes tax
    const cgstAmount =
      item.gstRate && !item.isInterState
        ? subTotal.mul(item.gstRate).div(2).div(100)
        : new Decimal(0);
    const sgstAmount =
      item.gstRate && !item.isInterState
        ? subTotal.mul(item.gstRate).div(2).div(100)
        : new Decimal(0);
    const igstAmount =
      item.gstRate && item.isInterState
        ? subTotal.mul(item.gstRate).div(100)
        : new Decimal(0);
    const stateCessAdValoremAmount = item.stateCessAdValoremRate
      ? subTotal.mul(item.stateCessAdValoremRate).div(100)
      : new Decimal(0);
    const stateCessSpecificAmount = item.stateCessSpecificRate
      ? subTotal.mul(item.stateCessSpecificRate).div(100)
      : new Decimal(0);
    const cessAdValoremAmount = item.cessAdValoremRate
      ? subTotal.mul(item.cessAdValoremRate).div(100)
      : new Decimal(0);
    const cessSpecificAmount = item.cessSpecificRate
      ? subTotal.mul(item.cessSpecificRate).div(100)
      : new Decimal(0);

    // Total amount depends on includeTax flag
    let totalAmount;
    if (includeTax) {
      // If includeTax is true, include tax in the total
      totalAmount = subTotal
        .add(cgstAmount)
        .add(sgstAmount)
        .add(igstAmount)
        .add(cessAdValoremAmount)
        .add(cessSpecificAmount)
        .add(stateCessAdValoremAmount)
        .add(stateCessSpecificAmount);
    } else {
      // If includeTax is false, don't include tax in the total
      totalAmount = subTotal;
    }

    return {
      ...item,
      id: nanoid(),
      subTotal: subTotal.toDecimalPlaces(2),
      cgstAmount: includeTax ? cgstAmount.toDecimalPlaces(2) : new Decimal(0),
      sgstAmount: includeTax ? sgstAmount.toDecimalPlaces(2) : new Decimal(0),
      igstAmount: includeTax ? igstAmount.toDecimalPlaces(2) : new Decimal(0),
      cessAdValoremAmount: includeTax
        ? cessAdValoremAmount.toDecimalPlaces(2)
        : new Decimal(0),
      cessSpecificAmount: includeTax
        ? cessSpecificAmount.toDecimalPlaces(2)
        : new Decimal(0),
      stateCessAdValoremAmount: includeTax
        ? stateCessAdValoremAmount.toDecimalPlaces(2)
        : new Decimal(0),
      stateCessSpecificAmount: includeTax
        ? stateCessSpecificAmount.toDecimalPlaces(2)
        : new Decimal(0),
      discountAmount: discountAmount.toDecimalPlaces(2),
      totalAmount: totalAmount.toDecimalPlaces(2),
    };
  }

  static calculateInvoiceTotals(
    lineItems: ILineItem[],
    shouldRoundOff: boolean = false,
    includeTax: boolean = true,
  ) {
    const subTotal = lineItems.reduce(
      (sum, item) => sum.add(item.subTotal),
      new Decimal(0),
    );

    // Calculate total discount from line items
    const discountAmount = lineItems.reduce(
      (sum, item) => sum.add(item.discountAmount),
      new Decimal(0),
    );

    const cgstAmount = lineItems.reduce(
      (sum, item) => sum.add(item.cgstAmount),
      new Decimal(0),
    );
    const sgstAmount = lineItems.reduce(
      (sum, item) => sum.add(item.sgstAmount),
      new Decimal(0),
    );
    const igstAmount = lineItems.reduce(
      (sum, item) => sum.add(item.igstAmount),
      new Decimal(0),
    );
    const cessAdValoremAmount = lineItems.reduce(
      (sum, item) => sum.add(item.cessAdValoremAmount),
      new Decimal(0),
    );
    const cessSpecificAmount = lineItems.reduce(
      (sum, item) => sum.add(item.cessSpecificAmount),
      new Decimal(0),
    );
    const stateCessAdValoremAmount = lineItems.reduce(
      (sum, item) => sum.add(item.stateCessAdValoremAmount),
      new Decimal(0),
    );
    const stateCessSpecificAmount = lineItems.reduce(
      (sum, item) => sum.add(item.stateCessSpecificAmount),
      new Decimal(0),
    );
    const cessAmount = cessAdValoremAmount.add(cessSpecificAmount);
    const stateCessAmount = stateCessAdValoremAmount.add(
      stateCessSpecificAmount,
    );

    // Calculate total based on includeTax flag
    let totalBeforeRounding;
    if (includeTax) {
      // If includeTax is true, include tax in the total
      totalBeforeRounding = subTotal
        .add(cgstAmount)
        .add(sgstAmount)
        .add(igstAmount)
        .add(cessAdValoremAmount)
        .add(cessSpecificAmount)
        .add(stateCessAdValoremAmount)
        .add(stateCessSpecificAmount);
    } else {
      // If includeTax is false, don't include tax in the total
      totalBeforeRounding = subTotal;
    }

    let roundOffAmount = new Decimal(0);
    let totalAmount = totalBeforeRounding;

    if (shouldRoundOff) {
      const roundingResult = this.calculateRoundOff(totalBeforeRounding);
      roundOffAmount = roundingResult.roundOffAmount;
      totalAmount = roundingResult.finalAmount;
    }

    return {
      subTotal: subTotal.toDecimalPlaces(2),
      discountAmount: discountAmount.toDecimalPlaces(2),
      cgstAmount: includeTax ? cgstAmount.toDecimalPlaces(2) : new Decimal(0),
      sgstAmount: includeTax ? sgstAmount.toDecimalPlaces(2) : new Decimal(0),
      igstAmount: includeTax ? igstAmount.toDecimalPlaces(2) : new Decimal(0),
      cessAmount: includeTax ? cessAmount.toDecimalPlaces(2) : new Decimal(0),
      stateCessAmount: includeTax
        ? stateCessAmount.toDecimalPlaces(2)
        : new Decimal(0),
      roundOffAmount: roundOffAmount.toDecimalPlaces(2),
      totalAmount: totalAmount.toDecimalPlaces(2),
    };
  }
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractNumber(
  text: string,
  prefix: string,
  suffix: string,
): string | null {
  const escapedPrefix = escapeRegex(prefix);
  const escapedSuffix = escapeRegex(suffix);
  const re = new RegExp(`^${escapedPrefix}(\\d+)${escapedSuffix}$`);
  const match = re.exec(text);
  return match ? match[1] : null;
}

export function getInvoiceNumericPart(
  documentNumber: string,
  invoiceType: InvoiceType,
  organizationConfig?: IOrganizationConfig,
): string | null {
  switch (invoiceType) {
    case InvoiceType.INVOICE:
      return organizationConfig?.invoice
        ? extractNumber(
            documentNumber,
            organizationConfig.invoice.prefix,
            organizationConfig.invoice.suffix,
          )
        : null;

    case InvoiceType.PRO_FORMA:
      return organizationConfig?.proForma
        ? extractNumber(
            documentNumber,
            organizationConfig.proForma.prefix,
            organizationConfig.proForma.suffix,
          )
        : null;

    case InvoiceType.QUOTE:
      return organizationConfig?.quote
        ? extractNumber(
            documentNumber,
            organizationConfig.quote.prefix,
            organizationConfig.quote.suffix,
          )
        : null;

    case InvoiceType.ORDER:
      return organizationConfig?.purchaseOrder
        ? extractNumber(
            documentNumber,
            organizationConfig.purchaseOrder.prefix,
            organizationConfig.purchaseOrder.suffix,
          )
        : null;

    default:
      return null;
  }
}

export function getInvoiceConfigCurrentNumber(
  invoiceType: InvoiceType,
  organizationConfig?: IOrganizationConfig,
): string {
  switch (invoiceType) {
    case InvoiceType.INVOICE:
      return organizationConfig?.invoice?.currentNumber ?? '0';
    case InvoiceType.PRO_FORMA:
      return organizationConfig?.proForma?.currentNumber ?? '0';
    case InvoiceType.QUOTE:
      return organizationConfig?.quote?.currentNumber ?? '0';
    case InvoiceType.ORDER:
      return organizationConfig?.purchaseOrder?.currentNumber ?? '0';
    default:
      return '0';
  }
}

export function updateInvoiceConfigCurrentNumber(
  invoiceType: InvoiceType,
  currentNumber: string,
  organizationConfig: IOrganizationConfig,
): IOrganizationConfig {
  if (!organizationConfig) return organizationConfig;

  switch (invoiceType) {
    case InvoiceType.INVOICE:
      return {
        ...organizationConfig,
        invoice: { ...organizationConfig.invoice!, currentNumber },
      };

    case InvoiceType.PRO_FORMA:
      return {
        ...organizationConfig,
        proForma: { ...organizationConfig.proForma!, currentNumber },
      };

    case InvoiceType.QUOTE:
      return {
        ...organizationConfig,
        quote: { ...organizationConfig.quote!, currentNumber },
      };

    case InvoiceType.ORDER:
      return {
        ...organizationConfig,
        purchaseOrder: { ...organizationConfig.purchaseOrder!, currentNumber },
      };

    default:
      return organizationConfig;
  }
}

export function shouldUpdateInvoiceConfigCurrentNumber(
  transactionType: TransactionType,
  invoiceType: InvoiceType,
): boolean {
  return (
    (transactionType === TransactionType.SALES &&
      (invoiceType === InvoiceType.INVOICE ||
        invoiceType === InvoiceType.PRO_FORMA ||
        invoiceType === InvoiceType.QUOTE)) ||
    (transactionType === TransactionType.PURCHASE &&
      invoiceType === InvoiceType.ORDER)
  );
}

/**
 * Transforms line items from JSON data to ILineItem objects with proper Decimal instances
 * @param lineItems Array of line items from JSON data
 * @returns Array of line items with proper Decimal instances
 */
export function transformLineItems(lineItems: any[]): ILineItem[] {
  if (!lineItems || !Array.isArray(lineItems)) {
    return [];
  }

  return lineItems.map((item) => ({
    ...item,
    rate: new Decimal(item.rate),
    quantity: new Decimal(item.quantity),
    gstRate: new Decimal(item.gstRate),
    cessAdValoremRate: new Decimal(item.cessAdValoremRate || 0),
    cessSpecificRate: new Decimal(item.cessSpecificRate || 0),
    stateCessAdValoremRate: new Decimal(item.stateCessAdValoremRate || 0),
    stateCessSpecificRate: new Decimal(item.stateCessSpecificRate || 0),
    fixedDiscount: new Decimal(item.fixedDiscount || 0),
    percentageDiscount: new Decimal(item.percentageDiscount || 0),
    cgstAmount: new Decimal(item.cgstAmount || 0),
    sgstAmount: new Decimal(item.sgstAmount || 0),
    igstAmount: new Decimal(item.igstAmount || 0),
    cessAdValoremAmount: new Decimal(item.cessAdValoremAmount || 0),
    cessSpecificAmount: new Decimal(item.cessSpecificAmount || 0),
    stateCessAdValoremAmount: new Decimal(item.stateCessAdValoremAmount || 0),
    stateCessSpecificAmount: new Decimal(item.stateCessSpecificAmount || 0),
    subTotal: new Decimal(item.subTotal || 0),
    discountAmount: new Decimal(item.discountAmount || 0),
    totalAmount: new Decimal(item.totalAmount || 0),
  }));
}

/**
 * Transforms a single input line item from JSON data to ensure Decimal fields
 * @param item Line item data from API or other source
 * @returns The line item with proper Decimal instances
 */
export function transformInputLineItem<
  T extends ICreateLineItem | IUpdateLineItem,
>(item: T): T {
  const result = { ...item } as any;

  // Handle numeric fields, converting them to Decimal only if they exist
  result.rate = new Decimal((item.rate ?? 0).toString());
  result.quantity = new Decimal((item.quantity ?? 0).toString());
  result.gstRate = new Decimal((item.gstRate ?? 0).toString());
  result.cessAdValoremRate = new Decimal(
    (item.cessAdValoremRate ?? 0).toString(),
  );
  result.cessSpecificRate = new Decimal(
    (item.cessSpecificRate ?? 0).toString(),
  );
  result.stateCessAdValoremRate = new Decimal(
    (item.stateCessAdValoremRate ?? 0).toString(),
  );
  result.stateCessSpecificRate = new Decimal(
    (item.stateCessSpecificRate ?? 0).toString(),
  );
  result.fixedDiscount = new Decimal((item.fixedDiscount ?? 0).toString());
  result.percentageDiscount = new Decimal(
    (item.percentageDiscount ?? 0).toString(),
  );

  return result as T;
}

/**
 * Transforms an array of input line items from JSON data
 * @param items Array of line items from API or other source
 * @returns Array of line items with proper Decimal instances
 */
export function transformInputLineItems<
  T extends ICreateLineItem | IUpdateLineItem,
>(items: T[]): T[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items.map((item) => transformInputLineItem(item));
}
