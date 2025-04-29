import { JournalStatus, VoucherType, SourceType } from '@prisma/client';

export interface ICreateJournalLine {
  accountId: string;
  description?: string;
  debitAmount?: number;
  creditAmount?: number;
}

export interface IUpdateJournalLine extends Partial<ICreateJournalLine> {
  id: string;
}

export interface IFindAllJournalFilters {
  startDate?: string;
  endDate?: string;
  source?: SourceType;
  voucherType?: VoucherType;
  status?: JournalStatus;
}
export interface IJournal {
  voucherNumber: string;
  description?: string;
  date: Date | string;
  status: JournalStatus;
  voucherType: VoucherType;
  orgId: string;
  createdBy?: string;
  sourceType?: SourceType;
  sourceId?: string;
}

export interface ICreateJournal extends IJournal {
  lines: ICreateJournalLine[];
}

export interface IUpdateJournal extends Partial<IJournal> {
  id: string;
  lines: IUpdateJournalLine[];
}
