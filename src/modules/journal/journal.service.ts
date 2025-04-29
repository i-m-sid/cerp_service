import { ICreateJournal, IUpdateJournal, IFindAllJournalFilters } from './journal.interface';
import { JournalRepository } from './journal.repository';

export class JournalService {
  private repository: JournalRepository;

  constructor() {
    this.repository = new JournalRepository();
  }

  async create(data: ICreateJournal) {
    if (!data.lines || data.lines.length === 0) {
      throw new Error('At least one journal line is required');
    }
    // Optional: check that debits equal credits
    const totalDebit = data.lines.reduce(
      (sum, l) => sum + (l.debitAmount || 0),
      0,
    );
    const totalCredit = data.lines.reduce(
      (sum, l) => sum + (l.creditAmount || 0),
      0,
    );
    if (totalDebit !== totalCredit) {
      throw new Error('Total debit and credit amounts must be equal');
    }
    return this.repository.create(data);
  }

  async findAll(orgId: string, filters: IFindAllJournalFilters) {
    return this.repository.findAll(orgId, filters);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async update(data: IUpdateJournal) {
    if (data.lines && data.lines.length > 0) {
      const totalDebit = data.lines.reduce(
        (sum, l) => sum + (l.debitAmount || 0),
        0,
      );
      const totalCredit = data.lines.reduce(
        (sum, l) => sum + (l.creditAmount || 0),
        0,
      );
      if (totalDebit !== totalCredit) {
        throw new Error('Total debit and credit amounts must be equal');
      }
    }
    return this.repository.update(data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
