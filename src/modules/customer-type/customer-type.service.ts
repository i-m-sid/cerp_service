import {
  ICreateCustomerType,
  IUpdateCustomerType,
  IInternalCreateCustomerType,
} from './customer-type.interface';
import { CustomerTypeRepository } from './customer-type.repository';

export class CustomerTypeService {
  private repository: CustomerTypeRepository;

  constructor() {
    this.repository = new CustomerTypeRepository();
  }

  async create(data: IInternalCreateCustomerType) {
    // Check if customer type with this label already exists
    const existing = await this.repository.findByLabel(data.label);
    if (existing) {
      throw new Error('Customer type with this label already exists');
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(data: IUpdateCustomerType) {
    // If label is being updated, check if new label already exists
    if (data.label) {
      const existing = await this.repository.findByLabel(data.label);
      if (existing && existing.id !== data.id) {
        throw new Error('Customer type with this label already exists');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
