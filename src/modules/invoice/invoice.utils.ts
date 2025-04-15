import { ICreateLineItem, ILineItem } from './invoice.interface';

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

  static calculateLineItem(item: ICreateLineItem): ILineItem {
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

    const cgstAmount = this.roundToTwo(
      item.cgstPercentage ? (subTotal * item.cgstPercentage) / 100 : 0,
    );
    const sgstAmount = this.roundToTwo(
      item.sgstPercentage ? (subTotal * item.sgstPercentage) / 100 : 0,
    );
    const igstAmount = this.roundToTwo(
      item.igstPercentage ? (subTotal * item.igstPercentage) / 100 : 0,
    );

    const totalAmount = this.roundToTwo(
      subTotal + cgstAmount + sgstAmount + igstAmount,
    );

    return {
      ...item,
      id: crypto.randomUUID(),
      subTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      discountAmount,
      totalAmount,
    };
  }

  static calculateInvoiceTotals(
    lineItems: ILineItem[],
    shouldRoundOff: boolean = false,
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

    const totalBeforeRounding = this.roundToTwo(
      subTotal + cgstAmount + sgstAmount + igstAmount,
    );

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
      roundOffAmount,
      totalAmount,
    };
  }
}
