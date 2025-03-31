import { PrismaClient } from '@prisma/client';
import { ICreateUOM, IUpdateUOM, IInternalCreateUOM } from './uom.interface';

export class UOMRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    categories: false,
  };

  async create(data: IInternalCreateUOM) {
    return this.prisma.unitOfMeasurement.create({
      data,
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.unitOfMeasurement.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.unitOfMeasurement.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByShortCode(shortCode: string) {
    return this.prisma.unitOfMeasurement.findFirst({
      where: { shortCode },
      include: this.include,
    });
  }

  async update(data: IUpdateUOM) {
    const { id, ...updateData } = data;
    return this.prisma.unitOfMeasurement.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.unitOfMeasurement.delete({
      where: { id },
    });
  }
}
