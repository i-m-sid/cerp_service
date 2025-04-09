import {
  ChallanStatus,
  PartyType,
  FieldType,
  ItemCategory,
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
  dependsOn: string[];
}

export interface ICreateChallanTemplate {
  name: string;
  description?: string;
  fieldSchema: IChallanTemplateField[];
  allowedStatuses: ChallanStatus[];
  allowedPartyTypes: PartyType[];
  allowedItemCategories: ItemCategory[];
}

export interface IUpdateChallanTemplate
  extends Partial<ICreateChallanTemplate> {
  id: string;
}
