import { IChallanRecordResponse } from './challan-record.interface';
import { ChallanRecordTemplateRepository } from '../challan-record-template/challan-record-template.repository';
import { UserRole } from '@prisma/client';

export interface IChallanFilter {
  startDate?: Date;
  endDate?: Date;
  partyId?: string;
}

export class ChallanRecordService {
  private repository: ChallanRecordTemplateRepository;

  constructor() {
    this.repository = new ChallanRecordTemplateRepository();
  }

  /**
   * Retrieves challans based on a record template ID
   * @param recordTemplateId - The ID of the record template
   * @param role - User role for access control
   * @param filters - Optional filters for date range and party
   * @returns Promise containing the record template and filtered challans
   * @throws Error if record template is not found
   */
  async getChallansByRecordTemplate(
    recordTemplateId: string,
    role: UserRole,
    filters?: IChallanFilter,
  ): Promise<IChallanRecordResponse> {
    const result = await this.repository.getChallansByRecordTemplate(
      recordTemplateId,
      role,
      filters,
    );

    if (!result) {
      throw new Error('Record template not found');
    }

    return result;
  }
}
