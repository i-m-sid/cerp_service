import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
  IBulkUpdateChallans,
} from './challan.interface';
import { ChallanRepository } from './challan.repository';
import { ChallanTemplateField, PrismaClient } from '@prisma/client';
import { evaluateFormula } from './challan.utils';

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

    const fields = await this.prisma.challanTemplateField.findMany({
      where: {
        templateId: data.templateId,
      },
    });

    if (fields && data.customFields) {
      fields.forEach((field) => {
        const customFields = data.customFields;
        if (field.formula && customFields) {
          // Initialize the custom field if it doesn't exist
          if (!customFields[field.id]) {
            customFields[field.id] = { value: '0' };
          }
          // Now evaluate the formula
          customFields[field.id].value = evaluateFormula(
            field.formula,
            customFields,
          );
        }
      });
    }

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

  async update(data: IUpdateChallan, fieldSchema?: ChallanTemplateField[]) {
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

    const fields =
      fieldSchema ??
      (await this.prisma.challanTemplateField.findMany({
        where: {
          templateId: data.templateId,
        },
      }));

    if (fields && data.customFields) {
      fields.forEach((field) => {
        const customFields = data.customFields;
        if (field.formula && customFields) {
          // Initialize the custom field if it doesn't exist
          if (!customFields[field.id]) {
            customFields[field.id] = { value: '0' };
          }
          // Now evaluate the formula
          customFields[field.id].value = evaluateFormula(
            field.formula,
            customFields,
          );
        }
      });
    }

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
    const fieldSchema = await this.prisma.challanTemplateField.findMany({
      where: {
        templateId: challans[0].templateId,
      },
    });
    for (const challan of challans) {
      results.push(await this.update(challan, fieldSchema));
    }
    return results;
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
