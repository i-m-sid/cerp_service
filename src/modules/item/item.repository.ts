import { PrismaClient } from '@prisma/client';
import { ICreateItem, IUpdateItem } from './item.interface';

export class ItemRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    category: true,
  };

  async create(data: ICreateItem) {
    return this.prisma.item.create({
      data,
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.item.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByName(name: string) {
    return this.prisma.item.findFirst({
      where: { name },
      include: this.include,
    });
  }

  async findByCategoryId(categoryId: string) {
    return this.prisma.item.findMany({
      where: { categoryId },
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
