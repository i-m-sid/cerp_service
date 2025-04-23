import {
  ICreateChallanStatus,
  IUpdateChallanStatus,
} from './challan-status.interface';
import { ChallanStatusRepository } from './challan-status.repository';

export class ChallanStatusService {
  private repository: ChallanStatusRepository;

  constructor() {
    this.repository = new ChallanStatusRepository();
  }

  async create(data: ICreateChallanStatus, orgId: string) {
    return this.repository.create(data, orgId);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(id: string, data: IUpdateChallanStatus, orgId: string) {
    return this.repository.update(id, data, orgId);
  }

  async delete(id: string, orgId: string) {
    return this.repository.delete(id, orgId);
  }
}
