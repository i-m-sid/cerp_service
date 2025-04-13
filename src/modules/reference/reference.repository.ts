import { PrismaClient } from '@prisma/client';
import { TableReference } from './reference.interface';

export class ReferenceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly tables: TableReference[] = [
    { table: 'Party', label: 'Party' },
    { table: 'Vehicle', label: 'Vehicle' },
    { table: 'Item', label: 'Item' },
    { table: 'UOM', label: 'Unit of Measurement' },
  ];

  async getTableReferences(): Promise<TableReference[]> {
    return this.tables;
  }
}
