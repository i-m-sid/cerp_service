interface IAddress {
  shortAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

export interface ICreateCustomer {
  customerTypeIds: string[];
  gstNumber?: string;
  legalName: string;
  tradeName?: string;
  phoneNumber?: string;
  email?: string;
  openingBalance?: number;
  address?: IAddress;
  placeOfSupply: IAddress[];
  customFields: Map<string, any>;
}

export interface IUpdateCustomer extends Partial<ICreateCustomer> {
  id: string;
}
