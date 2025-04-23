export interface IAddress {
  shortAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state: string;
  country: string;
  pinCode?: string;
  stateCode: string;
}

export interface ICreateParty {
  partyTypeIds: string[];
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

export interface IUpdateParty extends Partial<ICreateParty> {
  id: string;
  orgId: string;
}
