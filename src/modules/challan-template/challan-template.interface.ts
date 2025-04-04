import {
  ChallanStatus,
  CustomerType,
  FieldType,
  ItemCategory,
} from '@prisma/client';

export interface IChallanTemplateField {
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
  dependsOn: string[];
}

export interface ICreateChallanTemplate {
  name: string;
  description?: string;
  fieldSchema: IChallanTemplateField[];
  allowedStatuses: ChallanStatus[];
  allowedCustomerTypes: CustomerType[];
  allowedItemCategories: ItemCategory[];
}

export interface IUpdateChallanTemplate
  extends Partial<ICreateChallanTemplate> {
  id: string;
}
