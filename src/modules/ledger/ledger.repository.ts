import { LedgerAccountType, PrismaClient } from '@prisma/client';
import {
  ICreateLedgerAccountCategory,
  IUpdateLedgerAccountCategory,
  ICreateLedgerAccount,
  IUpdateLedgerAccount,
} from './ledger.interface';
import { DEFAULT_ORGANIZATION_ID } from './ledger.categories.default';

const LEDGER_ACCOUNT_INCLUDE = {
  category: true,
  party: true,
  lines: {
    include: {
      journal: true,
    },
  },
} as const;

export class LedgerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Ledger Account Category CRUD
  async createCategory(data: ICreateLedgerAccountCategory) {
    return this.prisma.ledgerAccountCategory.create({ data });
  }

  async findAllCategories(orgId: string, accountType?: LedgerAccountType) {
    return this.prisma.ledgerAccountCategory.findMany({
      where: {
        accountType: accountType,
        OR: [{ orgId }, { orgId: DEFAULT_ORGANIZATION_ID }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCategoryById(id: string, orgId: string) {
    return this.prisma.ledgerAccountCategory.findFirst({
      where: {
        id,
        OR: [
          { orgId }, // org-specific
          { orgId: DEFAULT_ORGANIZATION_ID }, // default set
        ],
      },
    });
  }

  async updateCategory(data: IUpdateLedgerAccountCategory) {
    const { id, ...updateData } = data;
    return this.prisma.ledgerAccountCategory.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.ledgerAccountCategory.delete({ where: { id } });
  }

  // Ledger Account CRUD
  async createAccount(data: ICreateLedgerAccount) {
    return this.prisma.ledgerAccount.create({
      data,
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async findAllAccounts(orgId: string, categoryId?: string, partyId?: string) {
    return this.prisma.ledgerAccount.findMany({
      where: { orgId, categoryId, partyId },
      orderBy: { name: 'asc' },
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async findAccountById(id: string, orgId: string) {
    return this.prisma.ledgerAccount.findFirst({
      where: { id, orgId },
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async findByPartyId(partyId: string, orgId: string) {
    return this.prisma.ledgerAccount.findMany({
      where: { partyId, orgId },
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async findByName(name: string, orgId: string) {
    return this.prisma.ledgerAccount.findFirst({
      where: { name, orgId },
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async updateAccount(data: IUpdateLedgerAccount) {
    const { id, ...updateData } = data;
    return this.prisma.ledgerAccount.update({
      where: { id },
      data: updateData,
      include: LEDGER_ACCOUNT_INCLUDE,
    });
  }

  async deleteAccount(id: string) {
    return this.prisma.ledgerAccount.delete({ where: { id } });
  }
}
