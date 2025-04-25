import { InvoiceType, TransactionType } from '@prisma/client';
import {
  IDocumentConfig,
  IOrganizationConfig,
} from '../organization/organization.interface';
import { ICreateLineItem, ILineItem } from './invoice.interface';
import { nanoid } from 'nanoid';

export class InvoiceCalculator {
  private static calculateDiscount(
    amount: number,
    fixedDiscount?: number,
    percentageDiscount?: number,
  ): number {
    let totalDiscount = 0;

    if (percentageDiscount && percentageDiscount > 0) {
      totalDiscount += (amount * percentageDiscount) / 100;
    }

    if (fixedDiscount && fixedDiscount > 0) {
      totalDiscount += fixedDiscount;
    }

    return totalDiscount;
  }

  private static roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  private static calculateRoundOff(amount: number): {
    roundOffAmount: number;
    finalAmount: number;
  } {
    const roundedAmount = Math.round(amount);
    const roundOffAmount = roundedAmount - amount;
    return {
      roundOffAmount: this.roundToTwo(roundOffAmount),
      finalAmount: roundedAmount,
    };
  }

  static calculateLineItem(
    item: ICreateLineItem,
    includeTax: boolean = true,
  ): ILineItem {
    const quantity = item.quantity || 1;
    const baseAmount = this.roundToTwo(item.rate * quantity);
    const discountAmount = this.roundToTwo(
      this.calculateDiscount(
        baseAmount,
        item.fixedDiscount,
        item.percentageDiscount,
      ),
    );
    const subTotal = this.roundToTwo(baseAmount - discountAmount);

    // Calculate tax amounts - rate never includes tax
    const cgstAmount = this.roundToTwo(
      item.gstRate && !item.isInterState ? (subTotal * item.gstRate / 2) / 100 : 0,
    );
    const sgstAmount = this.roundToTwo(
      item.gstRate && !item.isInterState ? (subTotal * item.gstRate / 2) / 100 : 0,
    );
    const igstAmount = this.roundToTwo(
      item.gstRate && item.isInterState ? (subTotal * item.gstRate) / 100 : 0,
    );
    const stateCessAdValoremAmount = this.roundToTwo(
      item.stateCessAdValoremRate ? (subTotal * item.stateCessAdValoremRate) / 100 : 0,
    );
    const stateCessSpecificAmount = this.roundToTwo(
      item.stateCessSpecificRate ? (subTotal * item.stateCessSpecificRate) / 100 : 0,
    );
    const cessAdValoremAmount = this.roundToTwo(
      item.cessAdValoremRate ? (subTotal * item.cessAdValoremRate) / 100 : 0,
    );
    const cessSpecificAmount = this.roundToTwo(
      item.cessSpecificRate ? (subTotal * item.cessSpecificRate) / 100 : 0,
    );

    // Total amount depends on includeTax flag
    let totalAmount;
    if (includeTax) {
      // If includeTax is true, include tax in the total
      totalAmount = this.roundToTwo(
        subTotal + cgstAmount + sgstAmount + igstAmount + cessAdValoremAmount + cessSpecificAmount + stateCessAdValoremAmount + stateCessSpecificAmount,
      );
    } else {
      // If includeTax is false, don't include tax in the total
      totalAmount = subTotal;
    }

    return {
      ...item,
      id: nanoid(),
      subTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cessAdValoremAmount,
      cessSpecificAmount,
      stateCessAdValoremAmount,
      stateCessSpecificAmount,
      discountAmount,
      totalAmount,
    };
  }

  static calculateInvoiceTotals(
    lineItems: ILineItem[],
    shouldRoundOff: boolean = false,
    includeTax: boolean = true,
  ) {
    const subTotal = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.subTotal, 0),
    );

    // Calculate total discount from line items
    const discountAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.discountAmount, 0),
    );

    const cgstAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.cgstAmount, 0),
    );
    const sgstAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.sgstAmount, 0),
    );
    const igstAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.igstAmount, 0),
    );
    const cessAdValoremAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.cessAdValoremAmount, 0),
    );
    const cessSpecificAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.cessSpecificAmount, 0),
    );
    const stateCessAdValoremAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.stateCessAdValoremAmount, 0),
    );
    const stateCessSpecificAmount = this.roundToTwo(
      lineItems.reduce((sum, item) => sum + item.stateCessSpecificAmount, 0),
    );
    const cessAmount = this.roundToTwo(cessAdValoremAmount + cessSpecificAmount);
    const stateCessAmount = this.roundToTwo(stateCessAdValoremAmount + stateCessSpecificAmount);

    // Calculate total based on includeTax flag
    let totalBeforeRounding;
    if (includeTax) {
      // If includeTax is true, include tax in the total
      totalBeforeRounding = this.roundToTwo(
        subTotal + cgstAmount + sgstAmount + igstAmount + cessAdValoremAmount + cessSpecificAmount + stateCessAdValoremAmount + stateCessSpecificAmount,
      );
    } else {
      // If includeTax is false, don't include tax in the total
      totalBeforeRounding = subTotal;
    }

    let roundOffAmount = 0;
    let totalAmount = totalBeforeRounding;

    if (shouldRoundOff) {
      const roundingResult = this.calculateRoundOff(totalBeforeRounding);
      roundOffAmount = roundingResult.roundOffAmount;
      totalAmount = roundingResult.finalAmount;
    }

    return {
      subTotal,
      discountAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cessAmount,
      stateCessAmount,
      roundOffAmount,
      totalAmount,
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
