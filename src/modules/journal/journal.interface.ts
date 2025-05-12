import {
  JournalStatus,
  VoucherType,
  SourceType,
  Prisma,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ICreateJournalLine {
  accountId: string;
  description?: string;
  debitAmount?: Decimal;
  creditAmount?: Decimal;
}

export interface IUpdateJournalLine extends ICreateJournalLine {
  id?: string;
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

export interface ICreateJournal {
  description?: string;
  date: Date;
  status: JournalStatus;
  voucherType: VoucherType;
  orgId: string;
  createdBy?: string;
  sourceType?: SourceType;
  sourceId?: string;
  lines: ICreateJournalLine[];
}

export interface IUpdateJournal extends Partial<Omit<ICreateJournal, 'lines'>> {
  id: string;
  voucherNumber?: string;
  lines?: IUpdateJournalLine[];
}
