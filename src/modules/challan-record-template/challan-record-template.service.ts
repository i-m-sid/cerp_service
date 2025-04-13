import { UserRole } from '@prisma/client';
import {
  ICreateChallanRecordTemplate,
  IUpdateChallanRecordTemplate,
} from './challan-record-template.interface';
import { ChallanRecordTemplateRepository } from './challan-record-template.repository';

export class ChallanRecordTemplateService {
  private repository: ChallanRecordTemplateRepository;

  constructor() {
    this.repository = new ChallanRecordTemplateRepository();
  }

  async create(data: ICreateChallanRecordTemplate) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByTemplateId(templateId: string) {
    return this.repository.findByTemplateId(templateId);
  }

  async update(data: IUpdateChallanRecordTemplate) {
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
