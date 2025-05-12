import { Decimal } from "@prisma/client/runtime/library";

export interface ICreateItemCategory {
  name: string;
  isService: boolean;
  description?: string;
  gstRate?: Decimal;
  cessAdValoremRate?: Decimal;
  cessSpecificRate?: Decimal;
  stateCessAdValoremRate?: Decimal;
  stateCessSpecificRate?: Decimal;
  hsnCode?: string;
  orgId: string;
  allowedUnits?: string[]; // Array of UOM IDs
}

export interface IUpdateItemCategory extends Partial<ICreateItemCategory> {
  id: string;
}
