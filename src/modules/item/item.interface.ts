export interface ICreateItem {
  name: string;
  description?: string;
  categoryId: string;
  orgId: string;
}

export interface IUpdateItem extends Partial<ICreateItem> {
  id: string;
}
