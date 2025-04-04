import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
} from './challan.interface';
import { ChallanRepository } from './challan.repository';

export class ChallanService {
  private repository: ChallanRepository;

  constructor() {
    this.repository = new ChallanRepository();
  }

  async create(data: ICreateChallan) {
    // Ensure date is a Date object if provided as a string
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

    // Pass data directly (customFields is now Record<string, ...>)
    return this.repository.create({
      ...data,
      date: dateObject,
    });
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

  async update(data: IUpdateChallan) {
    // Ensure date is a Date object if provided as a string
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

    // Pass data directly (customFields is now Record<string, ...>)
    return this.repository.update({
      ...data,
      date: dateObject,
    });
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
