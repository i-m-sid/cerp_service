import { UserRole } from '@prisma/client';
import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
} from './challan-template.interface';
import { ChallanTemplateRepository } from './challan-template.repository';

export class ChallanTemplateService {
  private repository: ChallanTemplateRepository;

  constructor() {
    this.repository = new ChallanTemplateRepository();
  }

  async create(data: ICreateChallanTemplate, orgId: string) {
    data.fieldSchema.forEach((field) => {
      field.allowedRoles.push(UserRole.OWNER);
      field.allowedRoles = [...new Set(field.allowedRoles)];
    });
    return this.repository.create(data, orgId);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdateChallanTemplate) {
    const { allowedPartyTypes, allowedItemCategories } = data;
    if (data.fieldSchema) {
      data.fieldSchema.forEach((field) => {
        field.allowedRoles.push(UserRole.OWNER);
        field.allowedRoles = [...new Set(field.allowedRoles)];
      });
    }

    // Clear existing relations if new ones are provided
    if (allowedPartyTypes || allowedItemCategories) {
      await this.repository.clearRelations(data.id, {
        partyTypes: !!allowedPartyTypes,
        itemCategories: !!allowedItemCategories,
      });
    }

    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
