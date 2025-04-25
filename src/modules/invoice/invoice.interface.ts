import { InvoiceType, TransactionType, } from '@prisma/client';
import { IChallan } from '../challan/challan.interface';

export interface ICreateLineItem {
  itemId: string;
  item: string;
  hsnCode: string;
  isService: boolean;
  isInterState: boolean;
  uom: string;
  description: string;
  rate: number;
  quantity: number;
  gstRate: number;
  cessAdValoremRate: number;
  cessSpecificRate: number;
  stateCessAdValoremRate: number;
  stateCessSpecificRate: number;
  fixedDiscount: number;
  percentageDiscount: number;
  challanIds: string[];
}

export interface ICreateInvoice {
  challanTemplateId: string;
  invoiceNumber: string;
  poNumber?: string;
  date: Date;
  partyId: string;
  orgDetails: IOrgDetails;
  partyDetails: IPartyDetails;
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

export interface IOrgDetails {
  name?: string;
  address?: string;
  gstin?: string;
  email?: string;
  phone?: string;
}
export interface IPartyDetails {
  name?: string;
  address?: string;
  gstin?: string;
  contact?: string;
  shippingAddress?: string;
}

export interface IUpdateLineItem extends Partial<ICreateLineItem> {
  id: string;
}

export interface ILineItem extends ICreateLineItem {
  id: string;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAdValoremAmount: number;
  cessSpecificAmount: number;
  stateCessAdValoremAmount: number;
  stateCessSpecificAmount: number;
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

export interface IBulkDeleteInvoices {
  ids: string[];
}

export interface ILineItemChallan {
  isInterState?: boolean;
  rate?: number;
  quantity?: number;
  gstRate?: number;
  cessAdValoremRate?: number;
  cessSpecificRate?: number;
  stateCessAdValoremRate?: number;
  stateCessSpecificRate?: number;
  fixedDiscount?: number;
  percentageDiscount?: number;
  challans: IChallan[];
}
