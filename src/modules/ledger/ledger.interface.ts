import { LedgerAccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ICreateLedgerAccountCategory {
  name: string;
  code?: string;
  accountType: LedgerAccountType;
  description?: string;
  orgId: string;
}

export interface IUpdateLedgerAccountCategory
  extends Partial<ICreateLedgerAccountCategory> {
  id: string;
}

export interface ICreateLedgerAccount {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  categoryId: string;
  isBank?: boolean;
  bankMeta?: object;
  orgId: string;
  openingBalance?: Decimal;
  partyId?: string;
  isSystemGenerated?: boolean;
}

export interface IUpdateLedgerAccount extends Partial<ICreateLedgerAccount> {
  id: string;
}
