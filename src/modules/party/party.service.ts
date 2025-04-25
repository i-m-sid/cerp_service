import { IAddress, ICreateParty, IUpdateParty } from './party.interface';
import { PartyRepository } from './party.repository';

export function transformPartyData(party: any) {
  if (!party) return null;

  return {
    ...party,
    address: party.address ? (party.address as unknown as IAddress) : undefined,
    placeOfSupply: party.placeOfSupply
      ? (party.placeOfSupply as unknown as IAddress[])
      : [],
    customFields: party.customFields
      ? (party.customFields as unknown as Map<string, any>)
      : new Map(),
  };
}
export class PartyService {
  private repository: PartyRepository;

  constructor() {
    this.repository = new PartyRepository();
  }

  async create(data: ICreateParty, orgId: string) {
    // Check if GST number already exists (if provided)
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(
        data.gstNumber,
        orgId,
      );
      if (existing) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    const party = await this.repository.create(data, orgId);
    return transformPartyData(party);
  }

  async findAll(orgId: string) {
    const parties = await this.repository.findAll(orgId);
    return parties.map((party) => transformPartyData(party));
  }

  async findById(id: string, orgId: string) {
    const party = await this.repository.findById(id, orgId);
    return transformPartyData(party);
  }

  async findByPartyType(partyTypeId: string, orgId: string) {
    const parties = await this.repository.findByPartyType(partyTypeId, orgId);
    return parties.map((party) => transformPartyData(party));
  }

  async update(data: IUpdateParty) {
    // If GST number is being updated, check if new number already exists
    if (data.gstNumber) {
      const existing = await this.repository.findByGstNumber(
        data.gstNumber,
        data.orgId!,
      );
      if (existing && existing.id !== data.id) {
        throw new Error('Customer with this GST number already exists');
      }
    }
    const party = await this.repository.update(data);
    return transformPartyData(party);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
