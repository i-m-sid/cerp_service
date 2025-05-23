import { PrismaClient, Prisma } from '@prisma/client';
import { ICreateParty, IUpdateParty } from './party.interface';

export class PartyRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    vehicles: false,
    allowedPartyTypes: true,
  };

  async create(data: ICreateParty, orgId: string) {
    const { address, placeOfSupply, customFields, partyTypeIds, ...rest } =
      data;

    const party = await this.prisma.party.create({
      data: {
        ...rest,
        openingBalance: data.openingBalance || 0,
        address: address as unknown as Prisma.JsonObject,
        placeOfSupply: placeOfSupply
          ? (placeOfSupply as unknown as Prisma.JsonObject)
          : Prisma.JsonNull,
        customFields: customFields as unknown as Prisma.JsonObject,
        allowedPartyTypes: {
          connect: partyTypeIds.map((id) => ({ id })),
        },
        organization: {
          connect: { id: orgId },
        },
      },
      include: this.include,
    });
    return party;
  }

  async findAll(orgId: string) {
    const parties = await this.prisma.party.findMany({
      where: {
        orgId,
      },
      orderBy: {
        tradeName: 'asc',
      },
      include: this.include,
    });
    return parties;
  }

  async findById(id: string, orgId: string) {
    const party = await this.prisma.party.findFirst({
      where: {
        id,
        orgId,
      },
      include: this.include,
    });
    return party;
  }

  async findByGstNumber(gstNumber: string, orgId: string) {
    const party = await this.prisma.party.findFirst({
      where: {
        gstNumber,
        orgId,
      },
      include: this.include,
    });
    return party;
  }

  async findByPartyType(partyTypeId: string, orgId: string) {
    const parties = await this.prisma.party.findMany({
      where: {
        allowedPartyTypes: { some: { id: partyTypeId } },
        orgId,
      },
      orderBy: {
        tradeName: 'asc',
      },
      include: this.include,
    });
    return parties;
  }

  async update(data: IUpdateParty) {
    const { id, address, placeOfSupply, customFields, partyTypeIds, ...rest } =
      data;
    const party = await this.prisma.party.update({
      where: { id },
      data: {
        ...rest,
        ...(address && { address: address as unknown as Prisma.JsonObject }),
        ...(placeOfSupply && {
          placeOfSupply: placeOfSupply as unknown as Prisma.JsonObject,
        }),
        ...(customFields && {
          customFields: customFields as unknown as Prisma.JsonObject,
        }),
        ...(partyTypeIds && {
          allowedPartyTypes: {
            set: partyTypeIds.map((id) => ({ id })),
          },
        }),
      },
      include: this.include,
    });
    return party;
  }

  async delete(id: string) {
    return this.prisma.party.delete({
      where: { id },
    });
  }
}
