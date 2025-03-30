import { ICreateUOM, IUpdateUOM } from './uom.interface';
import { UOMRepository } from './uom.repository';

export class UOMService {
  private repository: UOMRepository;

  constructor() {
    this.repository = new UOMRepository();
  }

  async create(data: ICreateUOM) {
    // Check if shortCode already exists
    const existing = await this.repository.findByShortCode(data.shortCode);
    if (existing) {
      throw new Error('UOM with this short code already exists');
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(data: IUpdateUOM) {
    // If shortCode is being updated, check if new code already exists
    if (data.shortCode) {
      const existing = await this.repository.findByShortCode(data.shortCode);
      if (existing && existing.id !== data.id) {
        throw new Error('UOM with this short code already exists');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
