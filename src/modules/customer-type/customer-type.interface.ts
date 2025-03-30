export interface ICreateCustomerType {
  label: string;
  createdBy: string;
}

export interface IUpdateCustomerType extends Partial<ICreateCustomerType> {
  id: string;
}
