import { Prisma } from '@prisma/client';

export interface ICustomField {
  id?: string;
  value: string;
}

export interface ICreateChallan {
  challanNumber: string;
  date: Date;
  templateId: string;
  statusId: string;
  customFields: Record<string, ICustomField>;
}

export interface IUpdateChallan extends Partial<ICreateChallan> {
  id: string;
}

export interface IBulkUpdateChallans {
  challans: IUpdateChallan[];
}

export interface IBulkDeleteChallans {
  ids: string[];
}

export interface IInternalCreateChallan extends ICreateChallan {
  createdAt?: Date;
  updatedAt?: Date;
}
