export interface ICreatePartyType {
  label: string;
  orgId: string;
}

export interface IUpdatePartyType extends Partial<ICreatePartyType> {
  id: string;
}
