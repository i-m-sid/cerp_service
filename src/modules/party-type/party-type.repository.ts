import { PrismaClient } from '@prisma/client';
import { ICreatePartyType, IUpdatePartyType } from './party-type.interface';

export class PartyTypeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    parties: true,
    templates: true,
  };

  async create(data: ICreatePartyType) {
    return this.prisma.partyType.create({
      data,
      include: this.include,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.partyType.findMany({
      where: { orgId },
      include: this.include,
      orderBy: {
        label: 'asc',
      },
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.partyType.findUnique({
      where: { id, orgId },
      include: this.include,
    });
  }

  async findByLabel(label: string, orgId: string) {
    return this.prisma.partyType.findUnique({
      where: { orgId_label: { orgId, label } },
      include: this.include,
    });
  }

  async update(data: IUpdatePartyType, orgId: string) {
    const { id, ...updateData } = data;
    return this.prisma.partyType.update({
      where: { id, orgId },
      data: data,
      include: this.include,
    });
  }

  async delete(id: string, orgId: string) {
    return this.prisma.partyType.delete({
      where: { id, orgId },
    });
  }
}
