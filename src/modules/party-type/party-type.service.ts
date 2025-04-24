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

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdatePartyType, orgId: string) {
    // If label is being updated, check if new label already exists
    if (data.label) {
      const existing = await this.repository.findById(data.id, orgId!);
      if (existing && existing.id !== data.id) {
        throw new Error('Party type with this label already exists');
      }
    }
    return this.repository.update(data, data.orgId!);
  }

  async delete(id: string, orgId: string) {
    return this.repository.delete(id, orgId);
  }
}
