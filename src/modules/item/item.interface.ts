import { Decimal } from '@prisma/client/runtime/library';

export interface IUOMConversionOverride {
  baseUQC: string;
  baseConversionFactor: Decimal;
}
export interface ICreateItem {
  name: string;
  description?: string;
  categoryId: string;
  orgId: string;
  uomConversionOverrides?: Record<string, IUOMConversionOverride>;
}

export interface IUpdateItem extends Partial<ICreateItem> {
  id: string;
}
