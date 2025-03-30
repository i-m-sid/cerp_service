export interface ICreateItemCategory {
  name: string;
  description?: string;
  hsnCode?: string;
  createdBy: string;
  allowedUnits?: string[]; // Array of UOM IDs
}

export interface IUpdateItemCategory extends Partial<ICreateItemCategory> {
  id: string;
}
