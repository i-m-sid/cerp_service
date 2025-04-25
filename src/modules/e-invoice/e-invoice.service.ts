import {
  Invoice,
  Organization,
  Party,
  UnitOfMeasurement,
} from '@prisma/client';
import { ILineItem, IPartyDetails } from '../invoice/invoice.interface';
import { EInvoice, EInvoiceItem } from './e-invoice.core.interface';
import { IAddress } from '../party/party.interface';
import { UOMService } from '../uom/uom.service';
import { InvoiceService } from '../invoice/invoice.service';

export class EInvoiceService {
  private uomService: UOMService;
  private invoiceService: InvoiceService;
  constructor() {
    this.uomService = new UOMService();
    this.invoiceService = new InvoiceService();
  }

  async generateEInvoiceV2(invoiceIds: string[], orgId: string) {
    const invoices = await this.invoiceService.findByIds(invoiceIds, orgId);
    const uoms = await this.uomService.findAll(invoices[0].organization.id);
    const eInvoices = invoices.map((invoice) =>
      this.invoiceToEInvoice(invoice, uoms),
    );
    return eInvoices;
  }

  invoiceToEInvoice(
    invoice: Invoice & { organization: unknown; party: unknown },
    uoms: UnitOfMeasurement[],
  ): EInvoice {
    const items = (invoice.lineItems as unknown as ILineItem[])?.map(
      (lineItem: ILineItem, index: number) =>
        this.lineItemToEInvoiceItem(index, lineItem, uoms),
    );
    const sellerDetails = invoice.organization as unknown as Organization;
    const sellerAddress = sellerDetails.address as unknown as IAddress;
    const buyerDetails = invoice.party as unknown as Party;
    const buyerAddress = buyerDetails.address as unknown as IAddress;

    if (sellerDetails.gstNumber == '') {
      throw new Error('Seller GST number not found');
    }

    if (buyerDetails.gstNumber == '') {
      throw new Error('Buyer GST number not found');
    }

    if (
      !buyerAddress ||
      buyerAddress.stateCode == '' ||
      !buyerAddress.pinCode ||
      !buyerAddress.city
    ) {
      throw new Error('Buyer address not complete');
    }

    if (
      !sellerAddress ||
      sellerAddress.stateCode == '' ||
      !sellerAddress.pinCode ||
      !sellerAddress.city
    ) {
      throw new Error('Seller address not complete');
    }
    return {
      Version: '1.1',
      TranDtls: {
        TaxSch: 'GST',
        SupTyp: 'B2B',
        IgstOnIntra: 'N',
        RegRev: 'N',
        EcmGstin: null,
      },
      DocDtls: {
        Typ: 'INV',
        No: invoice.invoiceNumber,
        Dt: this.formatDateToIST(invoice.date),
      },
      SellerDtls: {
        Gstin: sellerDetails.gstNumber ?? '',
        LglNm: sellerDetails.legalName,
        Addr1: sellerAddress.addressLine1 ?? '',
        Addr2: sellerAddress.addressLine2 ?? '',
        Loc: sellerAddress.city ?? '',
        Pin: Number(sellerAddress.pinCode),
        Stcd: sellerAddress.stateCode,
        Ph: sellerDetails.phoneNumber,
        Em: sellerDetails.email,
      },
      BuyerDtls: {
        Gstin: buyerDetails.gstNumber ?? '',
        LglNm: buyerDetails.legalName,
        Addr1: buyerAddress.addressLine1 ?? '',
        Addr2: buyerAddress.addressLine2 ?? '',
        Loc: buyerAddress.city ?? '',
        Pin: Number(buyerAddress.pinCode),
        Pos: buyerAddress.stateCode,
        Stcd: buyerAddress.stateCode,
        Ph: buyerDetails.phoneNumber,
        Em: buyerDetails.email,
      },
      ValDtls: {
        AssVal: Number(invoice.subTotal), //Todo: check if this is correct
        IgstVal: Number(invoice.igstAmount),
        CgstVal: Number(invoice.cgstAmount),
        SgstVal: Number(invoice.sgstAmount),
        CesVal: Number(invoice.cessAmount),
        StCesVal: Number(invoice.stateCessAmount),
        Discount: Number(invoice.discountAmount),
        OthChrg: 0,
        RndOffAmt: Number(invoice.roundOffAmount),
        TotInvVal: Number(invoice.totalAmount),
      },
      RefDtls: {
        InvRm: 'NICGEPP2.0',
      },
      ItemList: items,
    };
  }

  lineItemToEInvoiceItem(
    index: number,
    lineItem: ILineItem,
    uoms: UnitOfMeasurement[],
  ): EInvoiceItem {
    const uom = uoms.find((uom) => uom.id === lineItem.uomId);
    if (!uom) {
      throw new Error('UOM not found');
    }
    const uqc = uom?.baseUQC!;
    const quantity = parseFloat(
      (lineItem.quantity * Number(uom?.baseConversionFactor ?? 1)).toFixed(3),
    );
    const unitPrice = parseFloat(
      (lineItem.rate / Number(uom?.baseConversionFactor ?? 1)).toFixed(3),
    );
    return {
      SlNo: (index + 1).toString(),
      PrdDesc: lineItem.item,
      IsServc: lineItem.isService ? 'Y' : 'N',
      HsnCd: lineItem.hsnCode,
      Qty: quantity,
      FreeQty: 0,
      Unit: uqc,
      UnitPrice: unitPrice,
      TotAmt: lineItem.subTotal + lineItem.discountAmount,
      Discount: lineItem.discountAmount,
      PreTaxVal: 0,
      AssAmt: lineItem.subTotal,
      GstRt: lineItem.gstRate,
      IgstAmt: lineItem.igstAmount,
      CgstAmt: lineItem.cgstAmount,
      SgstAmt: lineItem.sgstAmount,
      CesRt: lineItem.cessAdValoremRate,
      CesAmt: lineItem.cessAdValoremAmount,
      CesNonAdvlAmt: lineItem.cessSpecificAmount,
      StateCesRt: lineItem.stateCessAdValoremRate,
      StateCesAmt: lineItem.stateCessAdValoremAmount,
      StateCesNonAdvlAmt: lineItem.stateCessSpecificAmount,
      OthChrg: 0,
      TotItemVal: lineItem.totalAmount,
    };
  }

  formatDateToIST(date: Date): string {
    // Convert to IST by adding 5 hours and 30 minutes
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

    // Format as DD/MM/YYYY
    const day = istDate.getUTCDate().toString().padStart(2, '0');
    const month = (istDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = istDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}
