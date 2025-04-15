import { DiscountType, InvoiceType, TransactionType } from '@prisma/client';

export interface ICreateLineItem {
  item: string;
  hsnCode: string;
  uom: string;
  description: string;
  rate: number;
  quantity: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  igstPercentage?: number;
  fixedDiscount?: number;
  percentageDiscount?: number;
}

export interface ICreateInvoice {
  invoiceNumber: string;
  date: Date;
  partyId: string;
  invoiceType: InvoiceType;
  transactionType: TransactionType;
  includeTax: boolean;
  roundOff: boolean;
  lineItems: ICreateLineItem[];
  challanIds?: string[];
  notes?: string;
  termsAndConditions?: string;
  orgId: string;
}

export interface IUpdateLineItem extends Partial<ICreateLineItem> {
  id: string;
}

export interface ILineItem extends ICreateLineItem {
  id: string;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
}

export interface IUpdateInvoice
  extends Partial<Omit<ICreateInvoice, 'lineItems'>> {
  id: string;
  orgId: string;
  lineItems?: IUpdateLineItem[];
}

export interface IBulkUpdateInvoices {
  invoices: IUpdateInvoice[];
}
