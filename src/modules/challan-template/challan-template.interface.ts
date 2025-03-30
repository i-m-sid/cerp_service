import { FieldType } from '@prisma/client';

export interface IChallanTemplateField {
  label: string;
  key: string;
  type: FieldType;
  flex: number;
  row: number;
  column: number;
  isRequired: boolean;
  data?: string[];
  refModel?: string;
  refKey?: string;
  refDisplay?: string;
}

export interface ICreateChallanTemplate {
  name: string;
  description?: string;
  fieldSchema: IChallanTemplateField[];
  statuses: IChallanStatus[];
  allowedCustomerTypes: string[];
  allowedItemCategories: string[];
}

export interface IUpdateChallanTemplate
  extends Partial<ICreateChallanTemplate> {
  id: string;
}

export interface IChallanStatus {
  id: string;
  label: string;
  color?: string;
  isDefault: boolean;
  templateId: string;
}
