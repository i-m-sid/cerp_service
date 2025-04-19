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

  async create(data: ICreateOrganization) {
    return this.repository.create(data);
  }

  async findAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async update(data: IUpdateOrganization, userId: string) {
    return this.repository.update(data, userId);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
