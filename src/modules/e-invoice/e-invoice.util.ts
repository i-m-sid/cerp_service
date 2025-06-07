import { Decimal } from '@prisma/client/runtime/library';
import { EInvoice, EInvoiceItem } from './e-invoice.core.interface';

/**
 * Converts all Decimal fields in an EInvoice or EInvoice[] to numbers, rounded to 3 decimal places without trailing zeros.
 * Only processes fields defined in EInvoice and EInvoiceItem interfaces.
 *
 * @param eInvoice - The EInvoice object or array to convert
 * @returns A new EInvoice object or array with all Decimal fields as numbers
 */
export function eInvoiceDecimalToNumber<T extends EInvoice | EInvoice[]>(
  eInvoice: T,
): T {
  if (Array.isArray(eInvoice)) {
    return eInvoice.map(eInvoiceDecimalToNumber) as T;
  }

  // Keys for ValDtls
  const valDtlsDecimalKeys = [
    'AssVal',
    'IgstVal',
    'CgstVal',
    'SgstVal',
    'CesVal',
    'StCesVal',
    'Discount',
    'OthChrg',
    'RndOffAmt',
    'TotInvVal',
  ] as const;

  // Convert ValDtls
  const valDtls = { ...eInvoice.ValDtls } as Record<string, any>;
  for (const key of valDtlsDecimalKeys) {
    if (valDtls[key] instanceof Decimal) {
      valDtls[key] = Number(valDtls[key].toFixed(3));
    }
  }

  // Keys for EInvoiceItem
  const itemDecimalKeys = [
    'Qty',
    'FreeQty',
    'UnitPrice',
    'TotAmt',
    'Discount',
    'PreTaxVal',
    'AssAmt',
    'GstRt',
    'IgstAmt',
    'CgstAmt',
    'SgstAmt',
    'CesRt',
    'CesAmt',
    'CesNonAdvlAmt',
    'StateCesRt',
    'StateCesAmt',
    'StateCesNonAdvlAmt',
    'OthChrg',
    'TotItemVal',
  ] as const;

  // Convert ItemList
  const itemList = eInvoice.ItemList.map((item) => {
    const newItem = { ...item } as Record<string, any>;
    for (const key of itemDecimalKeys) {
      if (newItem[key] instanceof Decimal) {
        newItem[key] = Number(newItem[key].toFixed(3));
      }
    }
    return newItem as unknown as EInvoiceItem;
  });

  // Return new EInvoice object
  return {
    ...eInvoice,
    ValDtls: valDtls as unknown,
    ItemList: itemList,
  } as T;
}
