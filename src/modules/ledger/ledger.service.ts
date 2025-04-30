import { LedgerAccountType } from '@prisma/client';
import {
  ICreateLedgerAccountCategory,
  IUpdateLedgerAccountCategory,
  ICreateLedgerAccount,
  IUpdateLedgerAccount,
} from './ledger.interface';
import { LedgerRepository } from './ledger.repository';
import {
  defaultLedgerCategories,
  DEFAULT_ORGANIZATION_ID,
} from './ledger.categories.default';

export class LedgerService {
  private repository: LedgerRepository;

  constructor() {
    this.repository = new LedgerRepository();
  }

  // Category
  async createCategory(data: ICreateLedgerAccountCategory) {
    return this.repository.createCategory(data);
  }

  async findAllCategories(orgId: string, accountType?: LedgerAccountType) {
    return this.repository.findAllCategories(orgId, accountType);
  }

  async findCategoryById(id: string, orgId: string) {
    return this.repository.findCategoryById(id, orgId);
  }

  async updateCategory(data: IUpdateLedgerAccountCategory) {
    return this.repository.updateCategory(data);
  }

  async deleteCategory(id: string) {
    return this.repository.deleteCategory(id);
  }

  // Account
  async createAccount(data: ICreateLedgerAccount) {
    return this.repository.createAccount(data);
  }

  async findAllAccounts(orgId: string, categoryId?: string, partyId?: string) {
    return this.repository.findAllAccounts(orgId, categoryId, partyId);
  }

  async findAccountById(id: string, orgId: string) {
    return this.repository.findAccountById(id, orgId);
  }

  async findByPartyId(partyId: string, orgId: string) {
    return this.repository.findByPartyId(partyId, orgId);
  }

  async findByName(name: string, orgId: string) {
    return this.repository.findByName(name, orgId);
  }

  async updateAccount(data: IUpdateLedgerAccount) {
    return this.repository.updateAccount(data);
  }

  async deleteAccount(id: string) {
    return this.repository.deleteAccount(id);
  }
}
