import {
  ChallanStatus,
  PartyType,
  FieldType,
  ItemCategory,
  UserRole,
  TransactionType,
} from '@prisma/client';

export interface IChallanTemplateField {
  id?: string;
  label: string;
  type: FieldType;
  flex: number;
  row: number;
  column: number;
  isRequired: boolean;
  data: string[];
  refModel?: string;
  refKey?: string;
  refId?: string;
  invoiceField?: string;
  accessLevel: UserRole;
  dependsOn: string[];
}

export interface ICreateChallanTemplate {
  name: string;
  description?: string;
  transactionType: TransactionType;
  fieldSchema: IChallanTemplateField[];
  allowedStatuses: ChallanStatus[];
  allowedPartyTypes: PartyType[];
  allowedItemCategories: ItemCategory[];
}

export interface IUpdateChallanTemplate
  extends Partial<ICreateChallanTemplate> {
  id: string;
}
