import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
  IBulkUpdateChallans,
} from './challan.interface';
import { ChallanRepository } from './challan.repository';
import { PrismaClient } from '@prisma/client';

export class ChallanService {
  private repository: ChallanRepository;
  private prisma: PrismaClient;

  constructor() {
    this.repository = new ChallanRepository();
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateChallan) {
    // Ensure date is a Date object if provided as a string
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

    // Pass data directly (customFields is now Record<string, ...>)
    return this.repository.create({
      ...data,
      date: dateObject,
    });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findByTemplateId(templateId: string) {
    return this.repository.findByTemplateId(templateId);
  }

  async update(data: IUpdateChallan) {
    // Ensure date is a Date object if provided as a string
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

    // Pass data directly (customFields is now Record<string, ...>)
    return this.repository.update({
      ...data,
      date: dateObject,
    });
  }

  async bulkUpdate(data: IBulkUpdateChallans) {
    const { challans } = data;

    if (!challans || !Array.isArray(challans) || challans.length === 0) {
      throw new Error('No challans provided for bulk update');
    }
    let results = [];
    for (const challan of challans) {
      results.push(await this.update(challan));
    }
    return results;
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
