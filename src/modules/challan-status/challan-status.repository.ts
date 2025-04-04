import { PrismaClient, Prisma } from '@prisma/client';
import {
  ICreateChallanStatus,
  IUpdateChallanStatus,
} from './challan-status.interface';

export class ChallanStatusRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateChallanStatus) {
    const createData: Prisma.ChallanStatusCreateInput = {
      label: data.label,
      color: data.color,
    };

    return this.prisma.challanStatus.create({
      data: createData,
      include: {
        challans: true,
      },
    });
  }

  async findAll() {
    return this.prisma.challanStatus.findMany({
      include: {
        challans: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.challanStatus.findUnique({
      where: { id },
      include: {
        challans: true,
      },
    });
  }

  async update(id: string, data: IUpdateChallanStatus) {
    const updateData: Prisma.ChallanStatusUpdateInput = {
      label: data.label,
      color: data.color,
    };

    return this.prisma.challanStatus.update({
      where: { id },
      data: updateData,
      include: {
        challans: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.challanStatus.delete({
      where: { id },
    });
  }
}
