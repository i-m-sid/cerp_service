import { ChallanTemplateField } from '@prisma/client';

export interface ICreateChallanRecordTemplate {
  name: string;
  templateId: string;
  fieldIds: string[];
}

export interface IUpdateChallanRecordTemplate
  extends Partial<ICreateChallanRecordTemplate> {
  id: string;
}

// Response types that include the full field data
export interface IChallanRecordTemplateResponse {
  id: string;
  name: string;
  templateId: string;
  fields: ChallanTemplateField[];
  createdAt: Date;
  updatedAt: Date;
}
