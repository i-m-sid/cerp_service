import { ICreateItem, IUpdateItem } from './item.interface';
import { ItemRepository } from './item.repository';

export class ItemService {
  private repository: ItemRepository;

  constructor() {
    this.repository = new ItemRepository();
  }

  async create(data: ICreateItem) {
    // Check if item name already exists in the same category
    const existing = await this.repository.findByName(data.name, data.orgId);
    if (existing && existing.categoryId === data.categoryId) {
      throw new Error('Item with this name already exists in the category');
    }
    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByCategoryId(categoryId: string, orgId: string) {
    return this.repository.findByCategoryId(categoryId, orgId);
  }

  async update(data: IUpdateItem) {
    // If name is being updated, check if new name already exists in the category
    if (data.name) {
      const existing = await this.repository.findByName(data.name, data.orgId!);
      const currentItem = await this.repository.findById(data.id, data.orgId!);

      if (
        existing &&
        existing.id !== data.id &&
        existing.categoryId === (data.categoryId || currentItem?.categoryId)
      ) {
        throw new Error('Item with this name already exists in the category');
      }
    }

    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
