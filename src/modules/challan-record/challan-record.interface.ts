import { Challan, ChallanRecordTemplate } from '@prisma/client';

export interface IChallanRecordResponse {
  recordTemplate: ChallanRecordTemplate;
  challans: Array<Challan & {
    customFields: Record<string, any>;
  }>;
} 