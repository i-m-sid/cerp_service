import { PrismaClient, Prisma } from '@prisma/client';
import {
  ICreateOrganization,
  IUpdateOrganization,
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization.interface';

export class OrganizationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateOrganization) {
    return this.prisma.organization.create({
      data: {
        legalName: data.legalName,
        tradeName: data.tradeName,
        gstNumber: data.gstNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address ? JSON.stringify(data.address) : Prisma.JsonNull,
        members: {
          create: {
            userId: data.createdBy,
            role: 'OWNER',
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
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
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
  }

  async update(data: IUpdateOrganization) {
    return this.prisma.organization.update({
      where: { id: data.id },
      data: {
        legalName: data.legalName,
        tradeName: data.tradeName,
        gstNumber: data.gstNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address ? JSON.stringify(data.address) : Prisma.JsonNull,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  // Organization Membership methods
  async addMember(data: ICreateOrganizationMembership) {
    return this.prisma.organizationMembership.create({
      data,
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async updateMembership(data: IUpdateOrganizationMembership) {
    return this.prisma.organizationMembership.update({
      where: { id: data.id },
      data: {
        role: data.role,
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async removeMember(id: string) {
    return this.prisma.organizationMembership.delete({
      where: { id },
    });
  }

  async findMembershipById(id: string) {
    return this.prisma.organizationMembership.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async findMembershipsByOrgId(orgId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { orgId },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async findMembershipsByUserId(userId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { userId },
      include: {
        user: true,
        organization: true,
      },
    });
  }
}
