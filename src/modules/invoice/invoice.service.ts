import {
  ICreateInvoice,
  IUpdateInvoice,
  IBulkUpdateInvoices,
} from './invoice.interface';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceType, TransactionType, PrismaClient } from '@prisma/client';

export class InvoiceService {
  private repository: InvoiceRepository;
  private prisma: PrismaClient;

  constructor() {
    this.repository = new InvoiceRepository();
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateInvoice) {
    return this.repository.create(data);
  }

  async findAll(orgId: string) {
    return this.repository.findAll(orgId);
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByPartyId(partyId: string, orgId: string) {
    return this.repository.findByPartyId(partyId, orgId);
  }

  async update(data: IUpdateInvoice) {
    return this.repository.update(data);
  }

  async bulkUpdate(data: IBulkUpdateInvoices) {
    const { invoices } = data;

    if (!invoices || !Array.isArray(invoices) || invoices.length === 0) {
      throw new Error('No invoices provided for bulk update');
    }

    return this.repository.bulkUpdate(invoices);
  }

  async delete(id: string, orgId: string) {
    return this.repository.delete(id, orgId);
  }

  async findByTransactionType(transactionType: TransactionType, orgId: string) {
    return this.repository.findByTransactionType(transactionType, orgId);
  }

  async findByInvoiceType(invoiceType: InvoiceType, orgId: string) {
    return this.repository.findByInvoiceType(invoiceType, orgId);
  }

  async findByTypes(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
  ) {
    return this.repository.findByTypes(orgId, transactionType, invoiceType);
  }
}
