import { DiscountType, InvoiceType, TransactionType } from '@prisma/client';

export interface ILineItem {
  item: string;
  hsnCode: string;
  uom: string;
  description: string;
  rate: number;
  quantity: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  igstPercentage?: number;
  discount?: number;
  discountType?: DiscountType;
}

export interface ICreateInvoice {
  invoiceNumber: string;
  date: Date;
  partyId: string;
  invoiceType: InvoiceType;
  transactionType: TransactionType;
  includeTax: boolean;
  roundOff: boolean;
  lineItems: ILineItem[];
  challanIds?: string[];
  remarks?: string;
  discount?: number;
  discountType?: DiscountType;
  orgId: string;
}

export interface IUpdateInvoice extends Partial<ICreateInvoice> {
  id: string;
}

export interface IBulkUpdateInvoices {
  invoices: IUpdateInvoice[];
}
