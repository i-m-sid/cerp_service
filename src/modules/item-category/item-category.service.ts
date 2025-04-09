import {
  ICreateItemCategory,
  IUpdateItemCategory,
} from './item-category.interface';
import { ItemCategoryRepository } from './item-category.repository';

export class ItemCategoryService {
  private repository: ItemCategoryRepository;

  constructor() {
    this.repository = new ItemCategoryRepository();
  }

  async create(data: ICreateItemCategory) {
    // Check if category name already exists
    const existing = await this.repository.findByName(data.name, data.orgId);
    if (existing) {
      throw new Error('Item category with this name already exists');
    }
    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdateItemCategory) {
    // If name is being updated, check if new name already exists
    if (data.name) {
      const existing = await this.repository.findByName(data.name, data.orgId!);
      if (existing && existing.id !== data.id) {
        throw new Error('Item category with this name already exists');
      }
    }

    // Clear existing relations if new ones are provided
    if (data.allowedUnits) {
      await this.repository.clearRelations(data.id, data.orgId!);
    }

    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
