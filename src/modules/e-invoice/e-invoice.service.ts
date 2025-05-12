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
import { ItemService } from '../item/item.service';
import { Decimal } from '@prisma/client/runtime/library';
import { transformLineItems } from '../invoice/invoice.utils';

export class EInvoiceService {
  private uomService: UOMService;
  private invoiceService: InvoiceService;
  private itemService: ItemService;
  constructor() {
    this.uomService = new UOMService();
    this.invoiceService = new InvoiceService();
    this.itemService = new ItemService();
  }

  async generateEInvoiceV2(
    invoiceIds: string[],
    orgId: string,
  ): Promise<EInvoice[]> {
    const invoices = await this.invoiceService.findByIds(invoiceIds, orgId);
    const uoms = await this.uomService.findAll(invoices[0].organization.id);
    console.log(JSON.stringify(invoices, null, 2));
    const eInvoices = await Promise.all(
      invoices.map((invoice) => this.invoiceToEInvoice(invoice, uoms)),
    );
    return eInvoices;
  }

  async invoiceToEInvoice(
    invoice: Invoice & { organization: unknown; party: unknown },
    uoms: UnitOfMeasurement[],
  ): Promise<EInvoice> {
    const lineItems = transformLineItems(invoice.lineItems as unknown as any[]);
    const items = await Promise.all(
      lineItems.map((lineItem: ILineItem, index: number) =>
        this.lineItemToEInvoiceItem(index, lineItem, uoms, invoice.orgId),
      ),
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
        Pin: parseInt(sellerAddress.pinCode),
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
        Pin: parseInt(buyerAddress.pinCode),
        Pos: buyerAddress.stateCode,
        Stcd: buyerAddress.stateCode,
        Ph: buyerDetails.phoneNumber,
        Em: buyerDetails.email,
      },
      ValDtls: {
        AssVal: invoice.subTotal?.toDecimalPlaces(2) ?? new Decimal(0), //Todo: check if this is correct
        IgstVal: invoice.igstAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        CgstVal: invoice.cgstAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        SgstVal: invoice.sgstAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        CesVal: invoice.cessAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        StCesVal: invoice.stateCessAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        Discount: invoice.discountAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        OthChrg: new Decimal(0),
        RndOffAmt: invoice.roundOffAmount?.toDecimalPlaces(2) ?? new Decimal(0),
        TotInvVal: invoice.totalAmount?.toDecimalPlaces(2) ?? new Decimal(0),
      },
      RefDtls: {
        InvRm: 'NICGEPP2.0',
      },
      ItemList: items,
    };
  }

  async lineItemToEInvoiceItem(
    index: number,
    lineItem: ILineItem,
    uoms: UnitOfMeasurement[],
    orgId: string,
  ): Promise<EInvoiceItem> {
    const item = await this.itemService.findById(lineItem.itemId, orgId);
    const uom = uoms.find((uom) => uom.id === lineItem.uomId);
    var baseUQC = uom?.baseUQC;
    var baseConversionFactor = uom?.baseConversionFactor ?? new Decimal(1);
    if (
      item.uomConversionOverrides &&
      item.uomConversionOverrides[lineItem.uomId]
    ) {
      baseUQC = item.uomConversionOverrides[lineItem.uomId].baseUQC;
      baseConversionFactor =
        item.uomConversionOverrides[lineItem.uomId].baseConversionFactor;
    }
    if (!uom) {
      throw new Error('UOM not found');
    }
    const quantity = lineItem.quantity
      .mul(baseConversionFactor)
      .toDecimalPlaces(3);
    const unitPrice = lineItem.rate
      .div(baseConversionFactor)
      .toDecimalPlaces(3);
    if (!baseUQC) {
      throw new Error(`E-invoice UOM not configured for ${lineItem.item}`);
    }

    return {
      SlNo: (index + 1).toString(),
      PrdDesc: lineItem.item,
      IsServc: lineItem.isService ? 'Y' : 'N',
      HsnCd: lineItem.hsnCode,
      Qty: quantity,
      FreeQty: new Decimal(0),
      Unit: baseUQC,
      UnitPrice: unitPrice,
      TotAmt: lineItem.subTotal.add(lineItem.discountAmount).toDecimalPlaces(2),
      Discount: lineItem.discountAmount.toDecimalPlaces(2),
      PreTaxVal: new Decimal(0),
      AssAmt: lineItem.subTotal.toDecimalPlaces(2),
      GstRt: lineItem.gstRate.toDecimalPlaces(2),
      IgstAmt: lineItem.igstAmount.toDecimalPlaces(2),
      CgstAmt: lineItem.cgstAmount.toDecimalPlaces(2),
      SgstAmt: lineItem.sgstAmount.toDecimalPlaces(2),
      CesRt: lineItem.cessAdValoremRate.toDecimalPlaces(2),
      CesAmt: lineItem.cessAdValoremAmount.toDecimalPlaces(2),
      CesNonAdvlAmt: lineItem.cessSpecificAmount.toDecimalPlaces(2),
      StateCesRt: lineItem.stateCessAdValoremRate.toDecimalPlaces(2),
      StateCesAmt: lineItem.stateCessAdValoremAmount.toDecimalPlaces(2),
      StateCesNonAdvlAmt: lineItem.stateCessSpecificAmount.toDecimalPlaces(2),
      OthChrg: new Decimal(0),
      TotItemVal: lineItem.totalAmount.toDecimalPlaces(2),
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
