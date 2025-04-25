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
  AssVal: number;
  IgstVal: number;
  CgstVal: number;
  SgstVal: number;
  CesVal: number;
  StCesVal: number;
  Discount: number;
  OthChrg: number;
  /** Rounding‐off adjustment (+/-) */
  RndOffAmt: number;
  /** Grand total (invoice value) */
  TotInvVal: number;
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
  Qty: number;
  FreeQty: number;
  /** Unit of measure – must match UQC master (e.g. MTS) */
  Unit: string;
  UnitPrice: number;
  TotAmt: number;
  Discount: number;
  PreTaxVal: number;
  AssAmt: number;
  GstRt: number;
  IgstAmt: number;
  CgstAmt: number;
  SgstAmt: number;
  CesRt: number;
  CesAmt: number;
  CesNonAdvlAmt: number;
  StateCesRt: number;
  StateCesAmt: number;
  StateCesNonAdvlAmt: number;
  OthChrg: number;
  TotItemVal: number;
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
