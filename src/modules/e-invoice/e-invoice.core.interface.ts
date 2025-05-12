import { Decimal } from '@prisma/client/runtime/library';

/** Core Transaction‐level objects */
export interface TranDtls {
  /** Tax scheme – always “GST” in this feed */
  TaxSch: string;
  /** Supply type (B2B, B2C, SEZ, …) */
  SupTyp: string;
  /** “Y” if IGST charged even on an intra-state supply */
  IgstOnIntra: 'Y' | 'N';
  /** Reverse-charge flag */
  RegRev: 'Y' | 'N';
  /** E-commerce operator GSTIN (null when not through ECO) */
  EcmGstin?: string | null;
}

export interface DocDtls {
  /** Document type – INV, CRN, DBN, etc. */
  Typ: string;
  /** Document/invoice number */
  No: string;
  /** DD/MM/YYYY */
  Dt: string;
}

/** Re-usable address block for Seller / Buyer */
export interface PartyDtls {
  Gstin: string;
  LglNm: string;
  Addr1: string;
  Addr2: string;
  Loc: string;
  Pin: number;
  Pos?: string;
  Stcd: string;
  Ph?: string | null;
  Em?: string | null;
}

/** Buyer has two extra fields (Pos = place of supply) */
export interface BuyerDtls extends PartyDtls {
  Pos: string;
}

export interface ValDtls {
  AssVal: Decimal;
  IgstVal: Decimal;
  CgstVal: Decimal;
  SgstVal: Decimal;
  CesVal: Decimal;
  StCesVal: Decimal;
  Discount: Decimal;
  OthChrg: Decimal;
  /** Rounding‐off adjustment (+/-) */
  RndOffAmt: Decimal;
  /** Grand total (invoice value) */
  TotInvVal: Decimal;
}

export interface RefDtls {
  /** Free-form remark (here sent as “NICGEPP2.0”) */
  InvRm?: string | null;
}

/** One line in ItemList */
export interface EInvoiceItem {
  SlNo: string;
  PrdDesc: string;
  /** “Y” if service, “N” if goods */
  IsServc: 'Y' | 'N';
  HsnCd: string;
  Qty: Decimal;
  FreeQty: Decimal;
  /** Unit of measure – must match UQC master (e.g. MTS) */
  Unit: string;
  UnitPrice: Decimal;
  TotAmt: Decimal;
  Discount: Decimal;
  PreTaxVal: Decimal;
  AssAmt: Decimal;
  GstRt: Decimal;
  IgstAmt: Decimal;
  CgstAmt: Decimal;
  SgstAmt: Decimal;
  CesRt: Decimal;
  CesAmt: Decimal;
  CesNonAdvlAmt: Decimal;
  StateCesRt: Decimal;
  StateCesAmt: Decimal;
  StateCesNonAdvlAmt: Decimal;
  OthChrg: Decimal;
  TotItemVal: Decimal;
}

/** The complete e-invoice object */
export interface EInvoice {
  Version: string;
  TranDtls: TranDtls;
  DocDtls: DocDtls;
  SellerDtls: PartyDtls;
  BuyerDtls: BuyerDtls;
  ValDtls: ValDtls;
  RefDtls: RefDtls;
  ItemList: EInvoiceItem[];
}

/** The API actually returns an array of invoices */
export type EInvoiceFeed = EInvoice[];
