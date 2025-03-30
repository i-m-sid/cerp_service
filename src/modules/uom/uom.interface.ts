export interface ICreateUOM {
  label: string; // e.g., "Kilogram"
  shortCode: string; // e.g., "kg"
  createdBy: string;
}

export interface IUpdateUOM extends Partial<ICreateUOM> {
  id: string;
}
