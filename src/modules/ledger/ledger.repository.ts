import { LedgerAccountType, PrismaClient } from '@prisma/client';
import {
  ICreateLedgerAccountCategory,
  IUpdateLedgerAccountCategory,
  ICreateLedgerAccount,
  IUpdateLedgerAccount,
} from './ledger.interface';
import { DEFAULT_ORGANIZATION_ID } from './ledger.categories.default';

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
    return this.prisma.ledgerAccount.create({ data });
  }

  async findAllAccounts(orgId: string, categoryId?: string, partyId?: string) {
    return this.prisma.ledgerAccount.findMany({
      where: { orgId, categoryId, partyId },
      orderBy: { name: 'asc' },
      include: { category: true, party: true },
    });
  }

  async findAccountById(id: string, orgId: string) {
    return this.prisma.ledgerAccount.findFirst({
      where: { id, orgId },
      include: { category: true, party: true },
    });
  }

  async updateAccount(data: IUpdateLedgerAccount) {
    const { id, ...updateData } = data;
    return this.prisma.ledgerAccount.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAccount(id: string) {
    return this.prisma.ledgerAccount.delete({ where: { id } });
  }
}
