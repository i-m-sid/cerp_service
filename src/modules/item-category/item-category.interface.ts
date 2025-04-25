export interface ICreateItemCategory {
  name: string;
  isService: boolean;
  description?: string;
  gstRate?: number;
  cessAdValoremRate?: number;
  cessSpecificRate?: number;
  stateCessAdValoremRate?: number;
  stateCessSpecificRate?: number;
  hsnCode?: string;
  orgId: string;
  allowedUnits?: string[]; // Array of UOM IDs
}

export interface IUpdateItemCategory extends Partial<ICreateItemCategory> {
  id: string;
}
