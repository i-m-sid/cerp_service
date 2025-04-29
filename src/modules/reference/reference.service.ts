import { ReferenceRepository } from './reference.repository';
import { TableReference } from './reference.interface';
export class ReferenceService {
  private repository: ReferenceRepository;

  constructor() {
    this.repository = new ReferenceRepository();
  }

  async getTableReferences(): Promise<TableReference[]> {
    return this.repository.getTableReferences();
  }
}
