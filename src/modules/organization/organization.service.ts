import {
  ICreateOrganization,
  IUpdateOrganization,
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization.interface';
import { OrganizationRepository } from './organization.repository';
import { UserRepository } from '../user/user.repository';

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor() {
    this.repository = new OrganizationRepository();
  }

  async create(data: ICreateOrganization, userId: string) {
    // We no longer need to create default categories for each organization
    // as we're using system-wide defaults
    return this.repository.create(data, userId);
  }

  async findAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async findById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async update(data: IUpdateOrganization, userId: string) {
    return this.repository.update(data, userId);
  }

  async delete(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }
}
