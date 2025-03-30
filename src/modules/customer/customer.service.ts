import { ICreateCustomer, IUpdateCustomer } from './customer.interface';
import { CustomerRepository } from './customer.repository';

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  async create(data: ICreateCustomer) {
    // Check if GST number already exists (if provided)
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(data.gstNumber);
      if (existing) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByCustomerType(customerTypeId: string) {
    return this.repository.findByCustomerType(customerTypeId);
  }

  async update(data: IUpdateCustomer) {
    // If GST number is being updated, check if new number already exists
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(data.gstNumber);
      if (existing && existing.id !== data.id) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
