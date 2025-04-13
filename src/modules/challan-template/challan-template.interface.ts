import {
  ChallanStatus,
  PartyType,
  FieldType,
  ItemCategory,
  UserRole,
  InvoiceType,
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
  allowedRoles: UserRole[];
  dependsOn: string[];
}

export interface ICreateChallanTemplate {
  name: string;
  description?: string;
  invoiceType: InvoiceType;
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
