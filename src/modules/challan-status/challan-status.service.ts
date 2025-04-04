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

  async create(data: ICreateChallanStatus) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(id: string, data: IUpdateChallanStatus) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
