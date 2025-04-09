import {
  ICreateOrganization,
  IUpdateOrganization,
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization.interface';
import { OrganizationRepository } from './organization.repository';

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor() {
    this.repository = new OrganizationRepository();
  }

  async create(data: ICreateOrganization) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async update(data: IUpdateOrganization) {
    const org = await this.repository.findById(data.id);
    if (!org) {
      throw new Error('Organization not found');
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    const org = await this.repository.findById(id);
    if (!org) {
      throw new Error('Organization not found');
    }
    return this.repository.delete(id);
  }

  // Organization Membership methods
  async addMember(data: ICreateOrganizationMembership) {
    // Check if organization exists
    const org = await this.repository.findById(data.orgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Check if membership already exists
    const existingMemberships = await this.repository.findMembershipsByUserId(
      data.userId,
    );
    const alreadyMember = existingMemberships.some(
      (m) => m.orgId === data.orgId,
    );
    if (alreadyMember) {
      throw new Error('User is already a member of this organization');
    }

    return this.repository.addMember(data);
  }

  async updateMembership(data: IUpdateOrganizationMembership) {
    const membership = await this.repository.findMembershipById(data.id);
    if (!membership) {
      throw new Error('Membership not found');
    }

    // Prevent removing the last owner
    if (data.role && data.role !== 'OWNER') {
      const orgMembers = await this.repository.findMembershipsByOrgId(
        membership.orgId,
      );
      const owners = orgMembers.filter((m) => m.role === 'OWNER');
      if (owners.length === 1 && owners[0].id === data.id) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    return this.repository.updateMembership(data);
  }

  async removeMember(id: string) {
    const membership = await this.repository.findMembershipById(id);
    if (!membership) {
      throw new Error('Membership not found');
    }

    // Prevent removing the last owner
    if (membership.role === 'OWNER') {
      const orgMembers = await this.repository.findMembershipsByOrgId(
        membership.orgId,
      );
      const owners = orgMembers.filter((m) => m.role === 'OWNER');
      if (owners.length === 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    return this.repository.removeMember(id);
  }

  async findMembershipById(id: string) {
    return this.repository.findMembershipById(id);
  }

  async findMembershipsByOrgId(orgId: string) {
    return this.repository.findMembershipsByOrgId(orgId);
  }

  async findMembershipsByUserId(userId: string) {
    return this.repository.findMembershipsByUserId(userId);
  }

  async getUserRole(userId: string, orgId: string) {
    const memberships = await this.repository.findMembershipsByUserId(userId);
    const membership = memberships.find((m) => m.orgId === orgId);
    if (!membership) {
      throw new Error('User is not a member of this organization');
    }
    return membership.role;
  }

  async hasRole(userId: string, orgId: string, roles: string[]) {
    try {
      const userRole = await this.getUserRole(userId, orgId);
      return roles.includes(userRole);
    } catch (error) {
      return false;
    }
  }
}
