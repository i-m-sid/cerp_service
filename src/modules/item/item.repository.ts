import { PrismaClient } from '@prisma/client';
import { ICreateItem, IUpdateItem } from './item.interface';

export class ItemRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    category: {
      include: {
        allowedUnits: true,
      },
    },
  };

  async create(data: ICreateItem) {
    const { orgId, categoryId, ...createData } = data;
    return this.prisma.item.create({
      data: {
        ...createData,
        organization: {
          connect: { id: orgId },
        },
        category: {
          connect: { id: categoryId },
        },
      },
      include: this.include,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.item.findMany({
      where: { orgId },
      include: this.include,
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.item.findFirst({
      where: { id, orgId },
      include: this.include,
    });
  }

  async findByName(name: string, orgId: string) {
    return this.prisma.item.findFirst({
      where: { name, orgId },
      include: this.include,
    });
  }

  async findByCategoryId(categoryId: string, orgId: string) {
    return this.prisma.item.findMany({
      where: { categoryId, orgId },
      include: this.include,
    });
  }

  async findByTemplateId(templateId: string, orgId: string) {
    // First, get the challan template with its allowed categories
    const template = await this.prisma.challanTemplate.findUnique({
      where: { id: templateId },
      include: {
        allowedItemCategories: true,
      },
    });

    if (!template || !template.allowedItemCategories.length) {
      return [];
    }

    // Extract the category IDs
    const allowedCategoryIds = template.allowedItemCategories.map(
      (category: { id: string }) => category.id,
    );

    // Get items that belong to the allowed categories
    return this.prisma.item.findMany({
      where: {
        orgId,
        categoryId: {
          in: allowedCategoryIds,
        },
      },
      include: this.include,
    });
  }

  async update(data: IUpdateItem) {
    const { id, ...updateData } = data;
    return this.prisma.item.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.item.delete({
      where: { id },
    });
  }
}
