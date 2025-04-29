/**
 * Bank Statement Module Interfaces
 */

export interface IBankStatementEntry {
  transactionDate: Date;
  description: string;
  referenceNumber?: string;
  amount: number;
  closingBalance: number;
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
  openingBalance: number;
  closingBalance: number;
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
