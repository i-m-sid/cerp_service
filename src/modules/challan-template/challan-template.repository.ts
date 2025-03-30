import { PrismaClient } from '@prisma/client';
import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
} from './challan-template.interface';

export class ChallanTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    fieldSchema: true,
    allowedCustomerTypes: true,
    allowedItemCategories: true,
    statuses: true,
  };

  async create(data: ICreateChallanTemplate, createdBy: string) {
    const { allowedCustomerTypes, allowedItemCategories, ...templateData } =
      data;

    return this.prisma.challanTemplate.create({
      data: {
        ...templateData,
        createdBy: createdBy,
        fieldSchema: {
          createMany: {
            data: templateData.fieldSchema,
          },
        },
        statuses: {
          createMany: {
            data: templateData.statuses,
          },
        },
        allowedCustomerTypes: {
          connect: allowedCustomerTypes.map((id) => ({ id })),
        },
        allowedItemCategories: {
          connect: allowedItemCategories.map((id) => ({ id })),
        },
      },
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.challanTemplate.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.challanTemplate.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async clearRelations(
    id: string,
    options: { customerTypes?: boolean; itemCategories?: boolean },
  ) {
    return this.prisma.challanTemplate.update({
      where: { id },
      data: {
        ...(options.customerTypes && {
          allowedCustomerTypes: { set: [] },
        }),
        ...(options.itemCategories && {
          allowedItemCategories: { set: [] },
        }),
      },
    });
  }

  async update(data: IUpdateChallanTemplate) {
    const {
      id,
      allowedCustomerTypes,
      allowedItemCategories,
      fieldSchema,
      statuses,
      ...updateData
    } = data;

    return this.prisma.challanTemplate.update({
      where: { id },
      data: {
        ...updateData,
        ...(fieldSchema && {
          fieldSchema: {
            deleteMany: {},
            createMany: { data: fieldSchema },
          },
        }),
        ...(statuses && {
          statuses: {
            deleteMany: {},
            createMany: { data: statuses },
          },
        }),
        ...(allowedCustomerTypes && {
          allowedCustomerTypes: {
            connect: allowedCustomerTypes.map((id) => ({ id })),
          },
        }),
        ...(allowedItemCategories && {
          allowedItemCategories: {
            connect: allowedItemCategories.map((id) => ({ id })),
          },
        }),
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.challanTemplate.delete({
      where: { id },
    });
  }
}
