import { TransactionType, UserRole } from '@prisma/client';
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
      if (!field.accessLevel) {
        field.accessLevel = UserRole.OWNER;
      }
    });
    return this.repository.create(data, orgId);
  }

  async findAll(orgId: string, transactionType?: TransactionType) {
    return this.repository.findAll(orgId, transactionType);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdateChallanTemplate) {
    const { allowedPartyTypes, allowedItemCategories } = data;
    if (data.fieldSchema) {
      data.fieldSchema.forEach((field) => {
        if (!field.accessLevel) {
          field.accessLevel = UserRole.OWNER;
        }
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
