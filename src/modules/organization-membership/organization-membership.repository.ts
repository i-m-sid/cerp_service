import { PrismaClient, UserRole } from '@prisma/client';
import {
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization-membership.interface';

export class OrganizationMembershipRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        picture: true,
      },
    },
  };

  async create(data: ICreateOrganizationMembership, orgId: string) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.userEmailId },
    });

    if (!user) {
      throw new Error(`User with email ${data.userEmailId} not found`);
    }

    // Check if the membership already exists
    const existingMembership =
      await this.prisma.organizationMembership.findFirst({
        where: {
          userId: user.id,
          orgId,
        },
      });

    if (existingMembership) {
      throw new Error(`User is already a member of this organization`);
    }

    // Create the membership
    return this.prisma.organizationMembership.create({
      data: {
        userId: user.id,
        orgId,
        role: data.role,
      },
      include: this.include,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { orgId },
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.organizationMembership.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByUserIdAndOrgId(userId: string, orgId: string) {
    console.log(userId, orgId);
    return this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        orgId,
      },
      include: this.include,
    });
  }

  async findByUserEmail(email: string, orgId: string) {
    return this.prisma.organizationMembership.findFirst({
      where: {
        user: {
          email,
        },
        orgId,
      },
      include: this.include,
    });
  }

  async update(data: IUpdateOrganizationMembership) {
    return this.prisma.organizationMembership.update({
      where: { id: data.id },
      data: {
        role: data.role,
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.organizationMembership.delete({
      where: { id },
      include: this.include,
    });
  }
}
