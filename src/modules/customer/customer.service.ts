import { ICreateCustomer, IUpdateCustomer } from './customer.interface';
import { CustomerRepository } from './customer.repository';

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  private transformCustomerData(customer: any) {
    if (!customer) return null;

    return {
      ...customer,
      address: customer.address ? JSON.parse(customer.address) : undefined,
      placeOfSupply: customer.placeOfSupply
        ? JSON.parse(customer.placeOfSupply)
        : [],
      customFields: customer.customFields
        ? JSON.parse(customer.customFields)
        : new Map(),
    };
  }

  async create(data: ICreateCustomer) {
    // Check if GST number already exists (if provided)
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(data.gstNumber);
      if (existing) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    const customer = await this.repository.create(data);
    return this.transformCustomerData(customer);
  }

  async findAll() {
    const customers = await this.repository.findAll();
    return customers.map((customer) => this.transformCustomerData(customer));
  }

  async findById(id: string) {
    const customer = await this.repository.findById(id);
    return this.transformCustomerData(customer);
  }

  async findByCustomerType(customerTypeId: string) {
    const customers = await this.repository.findByCustomerType(customerTypeId);
    return customers.map((customer) => this.transformCustomerData(customer));
  }

  async update(data: IUpdateCustomer) {
    // If GST number is being updated, check if new number already exists
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(data.gstNumber);
      if (existing && existing.id !== data.id) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    const customer = await this.repository.update(data);
    return this.transformCustomerData(customer);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
