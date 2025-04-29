import {
  ICreateBankStatement,
  IUpdateBankStatement,
  IReconcileBankStatementEntry,
} from './bank-statement.interface';
import { BankStatementRepository } from './bank-statement.repository';

export class BankStatementService {
  private repository: BankStatementRepository;

  constructor() {
    this.repository = new BankStatementRepository();
  }

  async create(data: ICreateBankStatement) {
    if (!data.entries || data.entries.length === 0) {
      throw new Error('At least one bank statement entry is required');
    }

    // Validate that the closing balance of the last entry matches the end balance
    if (data.entries.length > 0) {
      const lastEntry = data.entries[data.entries.length - 1];
      if (lastEntry.closingBalance !== data.closingBalance) {
        throw new Error(
          'The closing balance of the last entry must match the end balance of the statement',
        );
      }
    }

    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByAccountId(accountId: string, orgId: string) {
    return this.repository.findByAccountId(accountId, orgId);
  }

  async update(data: IUpdateBankStatement) {
    if (data.entries && data.entries.length > 0) {
      // If closingBalance is being updated and entries are provided, validate
      if (data.closingBalance !== undefined) {
        const lastEntry = data.entries[data.entries.length - 1];
        if (lastEntry.closingBalance !== data.closingBalance) {
          throw new Error(
            'The closing balance of the last entry must match the end balance of the statement',
          );
        }
      }
    }

    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async reconcileEntry(data: IReconcileBankStatementEntry) {
    if (!data.journalId) {
      throw new Error('Journal ID is required for reconciliation');
    }

    return this.repository.reconcileEntry(data);
  }

  async unreconcileEntry(id: string) {
    return this.repository.unreconcileEntry(id);
  }
}
