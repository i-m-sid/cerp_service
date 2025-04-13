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

  async findAll() {
    return this.prisma.partyType.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.partyType.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByLabel(label: string, orgId: string) {
    return this.prisma.partyType.findUnique({
      where: { orgId_label: { orgId, label } },
      include: this.include,
    });
  }

  async update(data: IUpdatePartyType) {
    const { id, ...updateData } = data;
    return this.prisma.partyType.update({
      where: { id },
      data: updateData,
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.partyType.delete({
      where: { id },
    });
  }
}
