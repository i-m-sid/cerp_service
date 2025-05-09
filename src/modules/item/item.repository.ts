import { Prisma, PrismaClient } from '@prisma/client';
import {
  ICreateItem,
  IUOMConversionOverride,
  IUpdateItem,
} from './item.interface';

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
    const { orgId, categoryId, uomConversionOverrides, ...createData } = data;
    const item = await this.prisma.item.create({
      data: {
        ...createData,
        organization: {
          connect: { id: orgId },
        },
        category: {
          connect: { id: categoryId },
        },
        uomConversionOverrides:
          uomConversionOverrides as unknown as Prisma.JsonObject,
      },
      include: this.include,
    });

    return {
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    };
  }

  async findAll(orgId: string) {
    const items = await this.prisma.item.findMany({
      where: { orgId },
      include: this.include,
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => ({
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    }));
  }

  async findById(id: string, orgId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, orgId },
      include: this.include,
    });

    return {
      ...item,
      uomConversionOverrides: item?.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    };
  }

  async findByName(name: string, orgId: string) {
    const item = await this.prisma.item.findFirst({
      where: { name, orgId },
      include: this.include,
    });

    return {
      ...item,
      uomConversionOverrides: item?.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    };
  }

  async findByCategoryId(categoryId: string, orgId: string) {
    const items = await this.prisma.item.findMany({
      where: { categoryId, orgId },
      include: this.include,
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => ({
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    }));
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
    const items = await this.prisma.item.findMany({
      where: {
        orgId,
        categoryId: {
          in: allowedCategoryIds,
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: this.include,
    });

    return items.map((item) => ({
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    }));
  }

  async update(data: IUpdateItem) {
    const { id, uomConversionOverrides, ...updateData } = data;
    const item = await this.prisma.item.update({
      where: { id },
      data: updateData,
      include: this.include,
    });

    return {
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    };
  }

  async delete(id: string) {
    const item = await this.prisma.item.delete({
      where: { id },
    });

    return {
      ...item,
      uomConversionOverrides: item.uomConversionOverrides as unknown as Record<
        string,
        IUOMConversionOverride
      >,
    };
  }
}
