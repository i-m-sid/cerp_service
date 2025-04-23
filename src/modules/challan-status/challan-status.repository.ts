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

  async create(data: ICreateChallanStatus, orgId: string) {
    const createData: Prisma.ChallanStatusCreateInput = {
      label: data.label,
      color: data.color,
      organization: {
        connect: {
          id: orgId,
        },
      },
    };

    return this.prisma.challanStatus.create({
      data: createData,
      select: {
        id: true,
        label: true,
        color: true,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.challanStatus.findMany({
      where: {
        organization: {
          id: orgId,
        },
      },
      select: {
        id: true,
        label: true,
        color: true,
      },
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.challanStatus.findUnique({
      where: { id, organization: { id: orgId } },
      select: {
        id: true,
        label: true,
        color: true,
      },
    });
  }

  async update(id: string, data: IUpdateChallanStatus, orgId: string) {
    const updateData: Prisma.ChallanStatusUpdateInput = {
      label: data.label,
      color: data.color,
    };

    return this.prisma.challanStatus.update({
      where: { id, organization: { id: orgId } },
      data: updateData,
      select: {
        id: true,
        label: true,
        color: true,
      },
    });
  }

  async delete(id: string, orgId: string) {
    return this.prisma.challanStatus.delete({
      where: { id, organization: { id: orgId } },
      select: {
        id: true,
        label: true,
        color: true,
      },
    });
  }
}
