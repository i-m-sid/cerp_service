import { ICreateItem, IUpdateItem } from './item.interface';
import { ItemRepository } from './item.repository';

export class ItemService {
  private repository: ItemRepository;

  constructor() {
    this.repository = new ItemRepository();
  }

  async create(data: ICreateItem) {
    // Check if item name already exists in the same category
    const existing = await this.repository.findByName(data.name);
    if (existing && existing.categoryId === data.categoryId) {
      throw new Error('Item with this name already exists in the category');
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByCategoryId(categoryId: string) {
    return this.repository.findByCategoryId(categoryId);
  }

  async update(data: IUpdateItem) {
    // If name is being updated, check if new name already exists in the category
    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      const currentItem = await this.repository.findById(data.id);

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
