import { ICreateUOM, IUpdateUOM, IInternalCreateUOM } from './uom.interface';
import { UOMRepository } from './uom.repository';

export class UOMService {
  private repository: UOMRepository;

  constructor() {
    this.repository = new UOMRepository();
  }

  async create(data: ICreateUOM) {
    // Check if shortCode already exists
    const existing = await this.repository.findByShortCode(
      data.shortCode,
      data.orgId,
    );
    if (existing) {
      throw new Error('UOM with this short code already exists');
    }
    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdateUOM) {
    // If shortCode is being updated, check if new code already exists
    if (data.shortCode) {
      const existing = await this.repository.findByShortCode(
        data.shortCode,
        data.orgId!,
      );
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
