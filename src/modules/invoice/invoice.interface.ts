import { InvoiceType, TransactionType } from '@prisma/client';
import { IChallan } from '../challan/challan.interface';
import { Decimal } from '@prisma/client/runtime/library';

export interface ICreateLineItem {
  itemId: string;
  item: string;
  hsnCode: string;
  isService: boolean;
  isInterState: boolean;
  uom: string;
  uomId: string;
  description: string;
  rate: Decimal;
  quantity: Decimal;
  gstRate: Decimal;
  cessAdValoremRate: Decimal;
  cessSpecificRate: Decimal;
  stateCessAdValoremRate: Decimal;
  stateCessSpecificRate: Decimal;
  fixedDiscount: Decimal;
  percentageDiscount: Decimal;
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
  cgstAmount: Decimal;
  sgstAmount: Decimal;
  igstAmount: Decimal;
  cessAdValoremAmount: Decimal;
  cessSpecificAmount: Decimal;
  stateCessAdValoremAmount: Decimal;
  stateCessSpecificAmount: Decimal;
  subTotal: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
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
  rate?: Decimal;
  quantity?: Decimal;
  gstRate?: Decimal;
  cessAdValoremRate?: Decimal;
  cessSpecificRate?: Decimal;
  stateCessAdValoremRate?: Decimal;
  stateCessSpecificRate?: Decimal;
  fixedDiscount?: Decimal;
  percentageDiscount?: Decimal;
  challans: IChallan[];
}
