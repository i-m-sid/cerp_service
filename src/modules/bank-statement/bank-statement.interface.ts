/**
 * Bank Statement Module Interfaces
 */
import { Decimal } from '@prisma/client/runtime/library';
export interface IBankStatementEntry {
  transactionDate: Date;
  description: string;
  referenceNumber?: string;
  amount: Decimal;
  closingBalance: Decimal;
  isReconciled: boolean;
  journalId?: string;
}

export interface ICreateBankStatementEntry extends IBankStatementEntry {
  statementId: string;
}

export interface IUpdateBankStatementEntry
  extends Partial<IBankStatementEntry> {
  id: string;
}

export interface IBankStatement {
  accountId: string;
  startDate: Date;
  endDate: Date;
  openingBalance: Decimal;
  closingBalance: Decimal;
  orgId: string;
}

export interface ICreateBankStatement extends IBankStatement {
  entries: IBankStatementEntry[];
}

export interface IUpdateBankStatement extends Partial<IBankStatement> {
  id: string;
  entries: IUpdateBankStatementEntry[];
}

export interface IReconcileBankStatementEntry {
  id: string;
  journalId: string;
}
