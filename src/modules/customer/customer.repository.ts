import { PrismaClient, Prisma } from '@prisma/client';
import { ICreateCustomer, IUpdateCustomer } from './customer.interface';

export class CustomerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    customerType: true,
    vehicles: true,
  };

  async create(data: ICreateCustomer) {
    const { address, placeOfSupply, customFields, ...rest } = data;
    return this.prisma.customer.create({
      data: {
        ...rest,
        openingBalance: data.openingBalance || 0,
        address: address ? JSON.stringify(address) : Prisma.JsonNull,
        placeOfSupply: placeOfSupply
          ? JSON.stringify(placeOfSupply)
          : Prisma.JsonNull,
        customFields: customFields
          ? JSON.stringify(customFields)
          : Prisma.JsonNull,
      },
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByGstNumber(gstNumber: string) {
    return this.prisma.customer.findUnique({
      where: { gstNumber },
      include: this.include,
    });
  }

  async findByCustomerType(customerTypeId: string) {
    return this.prisma.customer.findMany({
      where: { customerTypeId },
      include: this.include,
    });
  }

  async update(data: IUpdateCustomer) {
    const { id, address, placeOfSupply, customFields, ...rest } = data;
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        ...(address && { address: JSON.stringify(address) }),
        ...(placeOfSupply && { placeOfSupply: JSON.stringify(placeOfSupply) }),
        ...(customFields && { customFields: JSON.stringify(customFields) }),
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
