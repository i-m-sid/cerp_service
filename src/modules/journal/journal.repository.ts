import { PrismaClient } from '@prisma/client';
import {
  ICreateJournal,
  IFindAllJournalFilters,
  IUpdateJournal,
} from './journal.interface';

export class JournalRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateJournal) {
    return this.prisma.journal.create({
      data: {
        ...data,
        lines: {
          create: data.lines,
        },
      },
      include: { lines: true },
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

  async update(data: IUpdateJournal) {
    const { id, lines, ...updateData } = data;
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
      // Get existing lines to determine which ones to update vs. create
      const existingLines = await this.prisma.journalLine.findMany({
        where: { journalId: id },
        select: { id: true },
      });
      const existingIds = new Set(existingLines.map((line) => line.id));

      // Separate lines that need to be created vs updated
      const linesToCreate = lines
        .filter((line) => !existingIds.has(line.id))
        .filter((line) => line.accountId !== undefined);
      const linesToUpdate = lines.filter((line) => existingIds.has(line.id));

      // Create new lines - use individual creates for better type safety
      for (const line of linesToCreate) {
        const { id: lineId, ...lineData } = line;
        await this.prisma.journalLine.create({
          data: {
            accountId: lineData.accountId!,
            description: lineData.description,
            debitAmount: lineData.debitAmount ?? 0,
            creditAmount: lineData.creditAmount ?? 0,
            journalId: id,
          },
        });
      }

      // Update existing lines
      for (const line of linesToUpdate) {
        const { id: lineId, ...lineData } = line;
        const updateFields: Record<string, any> = {};
        // Only include defined values
        Object.entries(lineData).forEach(([key, value]) => {
          if (value !== undefined) {
            updateFields[key] = value;
          }
        });

        if (Object.keys(updateFields).length > 0) {
          await this.prisma.journalLine.update({
            where: { id: lineId },
            data: updateFields,
          });
        }
      }
    }

    // Update the journal
    return this.prisma.journal.update({
      where: { id },
      data: prismaUpdateData,
      include: { lines: true },
    });
  }

  async delete(id: string) {
    return this.prisma.journal.delete({ where: { id } });
  }
}
