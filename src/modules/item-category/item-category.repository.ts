import { PrismaClient } from '@prisma/client';
import {
  ICreateItemCategory,
  IUpdateItemCategory,
} from './item-category.interface';
export class ItemCategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    items: true,
    templates: false,
    allowedUnits: true,
  };

  async create(data: ICreateItemCategory) {
    const { allowedUnits, ...categoryData } = data;

    return this.prisma.itemCategory.create({
      data: {
        ...categoryData,
        allowedUnits: {
          connect: allowedUnits?.map((id) => ({ id })) || [],
        },
      },
      include: this.include,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.itemCategory.findMany({
      where: { orgId },
      include: this.include,
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.itemCategory.findFirst({
      where: { id, orgId },
      include: this.include,
    });
  }

  async findByName(name: string, orgId: string) {
    return this.prisma.itemCategory.findFirst({
      where: { name, orgId },
      include: this.include,
    });
  }

  async clearRelations(id: string, orgId: string) {
    return this.prisma.itemCategory.update({
      where: { id, orgId },
      data: {
        allowedUnits: { set: [] },
      },
    });
  }

  async update(data: IUpdateItemCategory) {
    const { id, allowedUnits, ...updateData } = data;

    return this.prisma.itemCategory.update({
      where: { id },
      data: {
        ...updateData,
        ...(allowedUnits && {
          allowedUnits: {
            connect: allowedUnits.map((id) => ({ id })),
          },
        }),
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.itemCategory.delete({
      where: { id },
    });
  }
}
