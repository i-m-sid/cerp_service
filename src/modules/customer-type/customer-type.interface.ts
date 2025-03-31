export interface ICreateCustomerType {
  label: string;
}

export interface IInternalCreateCustomerType extends ICreateCustomerType {
  createdBy: string;
}

export interface IUpdateCustomerType extends Partial<ICreateCustomerType> {
  id: string;
}
