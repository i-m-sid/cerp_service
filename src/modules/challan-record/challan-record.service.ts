import { IChallanRecordResponse } from './challan-record.interface';
import { ChallanRecordTemplateRepository } from '../challan-record-template/challan-record-template.repository';

export class ChallanRecordService {
  private repository: ChallanRecordTemplateRepository;

  constructor() {
    this.repository = new ChallanRecordTemplateRepository();
  }

  /**
   * Retrieves challans based on a record template ID
   * @param recordTemplateId - The ID of the record template
   * @returns Promise containing the record template and filtered challans
   * @throws Error if record template is not found
   */
  async getChallansByRecordTemplate(
    recordTemplateId: string,
  ): Promise<IChallanRecordResponse> {
    const result =
      await this.repository.getChallansByRecordTemplate(recordTemplateId);

    if (!result) {
      throw new Error('Record template not found');
    }

    return result;
  }
}
