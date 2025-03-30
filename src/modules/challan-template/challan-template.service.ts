import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
} from './challan-template.interface';
import { ChallanTemplateRepository } from './challan-template.repository';

export class ChallanTemplateService {
  private repository: ChallanTemplateRepository;

  constructor() {
    this.repository = new ChallanTemplateRepository();
  }

  async create(data: ICreateChallanTemplate, userId: string) {
    return this.repository.create(data, userId);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(data: IUpdateChallanTemplate) {
    const { allowedCustomerTypes, allowedItemCategories } = data;

    // Clear existing relations if new ones are provided
    if (allowedCustomerTypes || allowedItemCategories) {
      await this.repository.clearRelations(data.id, {
        customerTypes: !!allowedCustomerTypes,
        itemCategories: !!allowedItemCategories,
      });
    }

    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
