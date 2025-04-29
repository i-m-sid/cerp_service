import { PrismaClient } from '@prisma/client';
import {
  ICreateBankStatement,
  IUpdateBankStatement,
  IReconcileBankStatementEntry,
} from './bank-statement.interface';

export class BankStatementRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateBankStatement) {
    return this.prisma.bankStatement.create({
      data: {
        ...data,
        entries: {
          create: data.entries,
        },
      },
      include: { entries: true, account: true },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.bankStatement.findMany({
      where: { orgId },
      orderBy: { endDate: 'desc' },
      include: {
        entries: {
          orderBy: { transactionDate: 'desc' },
        },
        account: true,
      },
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.bankStatement.findFirst({
      where: { id, orgId },
      include: {
        entries: {
          orderBy: { transactionDate: 'desc' },
        },
        account: true,
      },
    });
  }

  async findByAccountId(accountId: string, orgId: string) {
    return this.prisma.bankStatement.findMany({
      where: { accountId, orgId },
      orderBy: { endDate: 'desc' },
      include: {
        entries: {
          orderBy: { transactionDate: 'desc' },
        },
        account: true,
      },
    });
  }

  async update(data: IUpdateBankStatement) {
    const { id, entries, ...updateData } = data;
    // Remove orgId if present and filter undefined values
    const { orgId, ...rawUpdateData } = updateData;

    // Only include defined fields
    const prismaUpdateData: Record<string, any> = {};
    Object.entries(rawUpdateData).forEach(([key, value]) => {
      if (value !== undefined) {
        prismaUpdateData[key] = value;
      }
    });

    // Process the entries if provided
    if (entries && entries.length > 0) {
      // Get existing entries to determine which ones to update vs. create
      const existingEntries = await this.prisma.bankStatementEntry.findMany({
        where: { statementId: id },
        select: { id: true },
      });
      const existingIds = new Set(existingEntries.map((entry) => entry.id));

      // Separate entries that need to be created vs updated
      const entriesToCreate = entries
        .filter((entry) => !existingIds.has(entry.id))
        .filter(
          (entry) =>
            entry.transactionDate !== undefined &&
            entry.description !== undefined &&
            entry.amount !== undefined &&
            entry.closingBalance !== undefined,
        );
      const entriesToUpdate = entries.filter((entry) =>
        existingIds.has(entry.id),
      );

      // Create new entries - use individual creates for better type safety
      for (const entry of entriesToCreate) {
        const { id: entryId, ...entryData } = entry;
        await this.prisma.bankStatementEntry.create({
          data: {
            transactionDate: entryData.transactionDate!,
            description: entryData.description!,
            amount: entryData.amount!,
            closingBalance: entryData.closingBalance!,
            isReconciled: entryData.isReconciled ?? false,
            referenceNumber: entryData.referenceNumber,
            journalId: entryData.journalId,
            statementId: id,
          },
        });
      }

      // Update existing entries
      for (const entry of entriesToUpdate) {
        const { id: entryId, ...entryData } = entry;
        const updateFields: Record<string, any> = {};
        // Only include defined values
        Object.entries(entryData).forEach(([key, value]) => {
          if (value !== undefined) {
            updateFields[key] = value;
          }
        });

        if (Object.keys(updateFields).length > 0) {
          await this.prisma.bankStatementEntry.update({
            where: { id: entryId },
            data: updateFields,
          });
        }
      }
    }

    // Update the bank statement
    return this.prisma.bankStatement.update({
      where: { id },
      data: prismaUpdateData,
      include: { entries: true, account: true },
    });
  }

  async delete(id: string) {
    return this.prisma.bankStatement.delete({ where: { id } });
  }

  async reconcileEntry(data: IReconcileBankStatementEntry) {
    return this.prisma.bankStatementEntry.update({
      where: { id: data.id },
      data: {
        isReconciled: true,
        journalId: data.journalId,
      },
    });
  }

  async unreconcileEntry(id: string) {
    return this.prisma.bankStatementEntry.update({
      where: { id },
      data: {
        isReconciled: false,
        journalId: null,
      },
    });
  }
}
