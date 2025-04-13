import {
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization-membership.interface';
import { OrganizationMembershipRepository } from './organization-membership.repository';

export class OrganizationMembershipService {
  private repository: OrganizationMembershipRepository;

  constructor() {
    this.repository = new OrganizationMembershipRepository();
  }

  async create(data: ICreateOrganizationMembership, orgId: string) {
    return this.repository.create(data, orgId);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByUserIdAndOrgId(userId: string, orgId: string) {
    return this.repository.findByUserIdAndOrgId(userId, orgId);
  }

  async findByUserEmail(email: string, orgId: string) {
    return this.repository.findByUserEmail(email, orgId);
  }

  async update(data: IUpdateOrganizationMembership) {
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async getUserRole(orgId: string, userId: string) {
    const membership = await this.repository.findByUserIdAndOrgId(
      userId,
      orgId,
    );
    console.log(membership);
    return membership?.role;
  }
}
