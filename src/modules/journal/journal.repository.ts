import {
  PrismaClient,
  LedgerAccountType,
  Prisma,
  SourceType,
} from '@prisma/client';
import {
  ICreateJournal,
  IFindAllJournalFilters,
  IUpdateJournal,
  ICreateJournalLine,
  IUpdateJournalLine,
} from './journal.interface';
import { Decimal } from '@prisma/client/runtime/library';
export class JournalRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async updateAccountBalance(
    accountId: string,
    debitAmount: Decimal,
    creditAmount: Decimal,
    accountType: LedgerAccountType,
    tx: Prisma.TransactionClient,
  ) {
    // Calculate net change based on account type
    let netChange = new Decimal(0);

    switch (accountType) {
      case 'ASSET':
      case 'EXPENSE':
        // Debit increases, Credit decreases
        netChange = debitAmount.sub(creditAmount);
        break;
      case 'LIABILITY':
      case 'EQUITY':
      case 'REVENUE':
        // Credit increases, Debit decreases
        netChange = creditAmount.sub(debitAmount);
        break;
    }

    await tx.ledgerAccount.update({
      where: { id: accountId },
      data: {
        currentBalance: {
          increment: netChange,
        },
      },
    });
  }

  private async processJournalLines(
    lines: ICreateJournalLine[],
    operation: 'ADD' | 'REMOVE',
    tx: Prisma.TransactionClient,
  ) {
    for (const line of lines) {
      const account = await tx.ledgerAccount.findUnique({
        where: { id: line.accountId },
        include: { category: true },
      });

      if (!account) {
        throw new Error(`Account ${line.accountId} not found`);
      }

      const debitAmount = line.debitAmount || new Decimal(0);
      const creditAmount = line.creditAmount || new Decimal(0);

      // For removal operations, invert the amounts
      const finalDebitAmount =
        operation === 'ADD' ? debitAmount : debitAmount.neg();
      const finalCreditAmount =
        operation === 'ADD' ? creditAmount : creditAmount.neg();

      await this.updateAccountBalance(
        account.id,
        finalDebitAmount,
        finalCreditAmount,
        account.category.accountType,
        tx,
      );
    }
  }

  async create(data: ICreateJournal, voucherNumber: string) {
    return this.prisma.$transaction(async (tx) => {
      // Create the journal and its lines
      const journal = await tx.journal.create({
        data: {
          ...data,
          voucherNumber,
          lines: {
            create: data.lines,
          },
        },
        include: { lines: true },
      });

      // Update account balances
      await this.processJournalLines(data.lines, 'ADD', tx);

      return journal;
    });
  }

  async findAll(orgId: string, filters: IFindAllJournalFilters) {
    return this.prisma.journal.findMany({
      where: {
        orgId,
        ...(filters.voucherType && { voucherType: filters.voucherType }),
        ...(filters.source && { sourceType: filters.source }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { date: { gte: filters.startDate } }),
        ...(filters.endDate && { date: { lte: filters.endDate } }),
      },
      orderBy: { date: 'desc' },
      include: { lines: true },
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.journal.findFirst({
      where: { id, orgId },
      include: { lines: true },
    });
  }

  async findBySourceTypeAndSourceId(
    sourceType: SourceType,
    sourceId: string,
    orgId: string,
  ) {
    return this.prisma.journal.findFirst({
      where: { sourceType, sourceId, orgId },
      include: { lines: true },
    });
  }

  async update(data: IUpdateJournal) {
    const { id, lines, ...updateData } = data;

    return this.prisma.$transaction(async (tx) => {
      // Get existing journal with its lines
      const existingJournal = await tx.journal.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!existingJournal) {
        throw new Error(`Journal ${id} not found`);
      }

      // Remove the effect of existing lines
      await this.processJournalLines(
        existingJournal.lines.map((line) => ({
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description || undefined,
        })),
        'REMOVE',
        tx,
      );

      // Remove orgId if present and filter undefined values
      const { orgId, ...rawUpdateData } = updateData;

      // Only include defined fields
      const prismaUpdateData: Record<string, any> = {};
      Object.entries(rawUpdateData).forEach(([key, value]) => {
        if (value !== undefined) {
          prismaUpdateData[key] = value;
        }
      });

      // Process the lines if provided
      if (lines && lines.length > 0) {
        // Delete existing lines
        await tx.journalLine.deleteMany({
          where: { journalId: id },
        });

        // Create new lines
        const newLines = lines
          .filter((line) => line.accountId !== undefined)
          .map(({ id: _id, ...line }) => line);

        for (const lineData of newLines) {
          await tx.journalLine.create({
            data: {
              accountId: lineData.accountId,
              description: lineData.description,
              debitAmount: lineData.debitAmount ?? 0,
              creditAmount: lineData.creditAmount ?? 0,
              journalId: id,
            },
          });
        }

        // Update account balances for new lines
        await this.processJournalLines(newLines, 'ADD', tx);
      }

      // Update the journal
      return tx.journal.update({
        where: { id },
        data: prismaUpdateData,
        include: { lines: true },
      });
    });
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Get the journal with its lines
      const journal = await tx.journal.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!journal) {
        throw new Error(`Journal ${id} not found`);
      }

      // Remove the effect of the lines from account balances
      await this.processJournalLines(
        journal.lines.map((line) => ({
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description || undefined,
        })),
        'REMOVE',
        tx,
      );

      // First delete all journal lines
      await tx.journalLine.deleteMany({
        where: { journalId: id },
      });

      // Then delete the journal
      return tx.journal.delete({ where: { id } });
    });
  }
}
