import { PrismaClient } from '@prisma/client';
import {
  ICreateCustomerType,
  IUpdateCustomerType,
} from './customer-type.interface';

export class CustomerTypeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    customers: true,
    templates: true,
  };

  async create(data: ICreateCustomerType) {
    return this.prisma.customerType.create({
      data,
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.customerType.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.customerType.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByLabel(label: string) {
    return this.prisma.customerType.findUnique({
      where: { label },
      include: this.include,
    });
  }

  async update(data: IUpdateCustomerType) {
    const { id, ...updateData } = data;
    return this.prisma.customerType.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.customerType.delete({
      where: { id },
    });
  }
}
