export interface ICreateItem {
  name: string;
  description?: string;
  categoryId: string;
  createdBy: string;
}

export interface IUpdateItem extends Partial<ICreateItem> {
  id: string;
}
