import { ICreatePartyType, IUpdatePartyType } from './party-type.interface';
import { PartyTypeRepository } from './party-type.repository';

export class PartyTypeService {
  private repository: PartyTypeRepository;

  constructor() {
    this.repository = new PartyTypeRepository();
  }

  async create(data: ICreatePartyType) {
    // Check if party type with this label already exists
    const existing = await this.repository.findByLabel(data.label, data.orgId!);
    if (existing) {
      throw new Error('Party type with this label already exists');
    }
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async update(data: IUpdatePartyType) {
    // If label is being updated, check if new label already exists
    if (data.label) {
      const existing = await this.repository.findById(data.id);
      if (existing && existing.id !== data.id) {
        throw new Error('Party type with this label already exists');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
