export interface ICreateUOM {
  label: string; // e.g., "Kilogram"
  shortCode: string; // e.g., "kg"
}

export interface IInternalCreateUOM extends ICreateUOM {
  createdBy: string;
}

export interface IUpdateUOM {
  id: string;
  label?: string;
  shortCode?: string;
}
