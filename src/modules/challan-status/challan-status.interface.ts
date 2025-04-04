export interface ICreateChallanStatus {
  label: string;
  color?: string;
}

export interface IUpdateChallanStatus extends ICreateChallanStatus {
  id: string;
}

export interface IInternalCreateChallanStatus extends ICreateChallanStatus {
  createdAt?: Date;
  updatedAt?: Date;
}
