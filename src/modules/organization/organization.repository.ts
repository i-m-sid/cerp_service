import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import {
  ICreateOrganization,
  IUpdateOrganization,
  IOrganizationWithRole,
} from './organization.interface';

export class OrganizationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private transformToOrganizationWithRole(org: any): IOrganizationWithRole {
    if (!org.members || org.members.length === 0) {
      throw new Error('User does not have access to this organization');
    }

    return {
      id: org.id,
      orgName: org.orgName,
      legalName: org.legalName,
      tradeName: org.tradeName ?? undefined,
      gstNumber: org.gstNumber ?? undefined,
      phoneNumber: org.phoneNumber ?? undefined,
      email: org.email ?? undefined,
      address: org.address as any,
      createdAt: org.createdAt,
      role: org.members[0].role,
      config: (org.config as any) ?? undefined,
    };
  }

  async create(data: ICreateOrganization): Promise<IOrganizationWithRole> {
    const org = await this.prisma.organization.create({
      data: {
        orgName: data.orgName,
        legalName: data.legalName,
        tradeName: data.tradeName,
        gstNumber: data.gstNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address
          ? (data.address as unknown as Prisma.JsonObject)
          : Prisma.JsonNull,
        config: data.config
          ? (data.config as unknown as Prisma.JsonObject)
          : Prisma.JsonNull,
        members: {
          create: {
            userId: data.createdBy,
            role: UserRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.transformToOrganizationWithRole(org);
  }

  async findAll(userId: string): Promise<IOrganizationWithRole[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          include: {
            user: true,
          },
        },
      },
    });

    return organizations.map((org) =>
      this.transformToOrganizationWithRole(org),
    );
  }

  async findById(id: string): Promise<IOrganizationWithRole | null> {
    const org = await this.prisma.organization.findFirst({
      where: {
        id,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return org ? this.transformToOrganizationWithRole(org) : null;
  }

  async findByUserId(userId: string): Promise<IOrganizationWithRole[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          include: {
            user: true,
          },
        },
      },
    });

    return organizations.map((org) =>
      this.transformToOrganizationWithRole(org),
    );
  }

  async update(
    data: IUpdateOrganization,
    userId: string,
  ): Promise<IOrganizationWithRole> {
    const updateData: any = {};

    // Only include fields that are actually provided
    if (data.orgName !== undefined) updateData.orgName = data.orgName;
    if (data.legalName !== undefined) updateData.legalName = data.legalName;
    if (data.tradeName !== undefined) updateData.tradeName = data.tradeName;
    if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber;
    if (data.phoneNumber !== undefined)
      updateData.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) {
      updateData.address = data.address
        ? (data.address as unknown as Prisma.JsonObject)
        : Prisma.JsonNull;
    }
    if (data.config !== undefined) {
      updateData.config = data.config
        ? (data.config as unknown as Prisma.JsonObject)
        : undefined;
    }

    const org = await this.prisma.organization.update({
      where: { id: data.id },
      data: updateData,
      include: {
        members: {
          where: {
            userId,
          },
          include: {
            user: true,
          },
        },
      },
    });

    return this.transformToOrganizationWithRole(org);
  }

  async delete(id: string): Promise<IOrganizationWithRole> {
    const org = await this.prisma.organization.delete({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.transformToOrganizationWithRole(org);
  }
}
