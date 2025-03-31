import { PrismaClient, Prisma } from '@prisma/client';
import { ICreateCustomer, IUpdateCustomer } from './customer.interface';

const transformCustomer = (customer: any) => ({
  ...customer,
  openingBalance: customer.openingBalance?.toNumber(),
  placeOfSupply:
    customer.placeOfSupply?.map((p: any) => ({
      ...p,
      address: p.address ? JSON.parse(p.address) : null,
    })) || [],
  address: customer.address ? JSON.parse(customer.address) : null,
  customFields: customer.customFields
    ? JSON.parse(customer.customFields)
    : new Map(),
});
export class CustomerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    vehicles: false,
    allowedCustomerTypes: true,
  };

  async create(data: ICreateCustomer) {
    const { address, placeOfSupply, customFields, customerTypeIds, ...rest } =
      data;
    const customer = await this.prisma.customer.create({
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
        allowedCustomerTypes: {
          connect: customerTypeIds.map((id) => ({ id })),
        },
      },
      include: this.include,
    });
    return transformCustomer(customer);
  }

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      include: this.include,
    });
    return customers.map(transformCustomer);
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: this.include,
    });
    return transformCustomer(customer);
  }

  async findByGstNumber(gstNumber: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { gstNumber },
      include: this.include,
    });
    return transformCustomer(customer);
  }

  async findByCustomerType(customerTypeId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { allowedCustomerTypes: { some: { id: customerTypeId } } },
      include: this.include,
    });
    return customers.map(transformCustomer);
  }

  async update(data: IUpdateCustomer) {
    const {
      id,
      address,
      placeOfSupply,
      customFields,
      customerTypeIds,
      ...rest
    } = data;
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        ...(address && { address: JSON.stringify(address) }),
        ...(placeOfSupply && { placeOfSupply: JSON.stringify(placeOfSupply) }),
        ...(customFields && { customFields: JSON.stringify(customFields) }),
        ...(customerTypeIds && {
          allowedCustomerTypes: {
            set: customerTypeIds.map((id) => ({ id })),
          },
        }),
      },
      include: this.include,
    });
    return transformCustomer(customer);
  }

  async delete(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
