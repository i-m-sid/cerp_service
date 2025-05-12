import { SourceType } from '@prisma/client';
import {
  ICreateJournal,
  IUpdateJournal,
  IFindAllJournalFilters,
} from './journal.interface';
import { JournalRepository } from './journal.repository';
import { OrganizationService } from '../organization/organization.service';
import {
  generateJournalVoucherNumber,
  getJournalNumericPart,
  updateJournalConfigCurrentNumber,
} from './journal.utils';

export class JournalService {
  private repository: JournalRepository;
  private organizationService: OrganizationService;

  constructor() {
    this.repository = new JournalRepository();
    this.organizationService = new OrganizationService();
  }

  private async generateVoucherNumber(
    orgId: string,
    userId: string,
  ): Promise<string> {
    const org = await this.organizationService.findById(orgId, userId);
    const voucherNumber = generateJournalVoucherNumber(org?.config);

    // Update the current number in config
    if (org?.config) {
      const documentNumber = getJournalNumericPart(voucherNumber, org.config);
      if (documentNumber) {
        const updatedConfig = updateJournalConfigCurrentNumber(
          documentNumber,
          org.config,
        );
        await this.organizationService.update(
          { id: orgId, config: updatedConfig },
          userId,
        );
      }
    }

    return voucherNumber;
  }

  async create(data: ICreateJournal, userId: string) {
    if (!data.lines || data.lines.length === 0) {
      throw new Error('At least one journal line is required');
    }
    // Optional: check that debits equal credits
    const totalDebit = data.lines.reduce(
      (sum, l) => sum + (l.debitAmount ? Number(l.debitAmount) : 0),
      0,
    );
    const totalCredit = data.lines.reduce(
      (sum, l) => sum + (l.creditAmount ? Number(l.creditAmount) : 0),
      0,
    );
    if (totalDebit !== totalCredit) {
      throw new Error('Total debit and credit amounts must be equal');
    }

    const voucherNumber = await this.generateVoucherNumber(data.orgId, userId);

    return this.repository.create(data, voucherNumber);
  }

  async findAll(orgId: string, filters: IFindAllJournalFilters) {
    return this.repository.findAll(orgId, filters);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findBySourceTypeAndSourceId(
    sourceType: SourceType,
    sourceId: string,
    orgId: string,
  ) {
    return this.repository.findBySourceTypeAndSourceId(
      sourceType,
      sourceId,
      orgId,
    );
  }

  async update(data: IUpdateJournal) {
    if (data.lines && data.lines.length > 0) {
      const totalDebit = data.lines.reduce(
        (sum, l) => sum + (l.debitAmount ? Number(l.debitAmount) : 0),
        0,
      );
      const totalCredit = data.lines.reduce(
        (sum, l) => sum + (l.creditAmount ? Number(l.creditAmount) : 0),
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
