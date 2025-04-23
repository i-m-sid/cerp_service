import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
  IBulkUpdateChallans,
  IChallanFilter,
  IChallan,
} from './challan.interface';
import { ChallanRepository } from './challan.repository';
import { ChallanTemplateField, PrismaClient, FieldType, UserRole } from '@prisma/client';
import { evaluateFormula, evaluateFormulaFields } from './challan.utils';

export class ChallanService {
  private repository: ChallanRepository;
  private prisma: PrismaClient;

  constructor() {
    this.repository = new ChallanRepository();
    this.prisma = new PrismaClient();
  }

  // Validate required fields
  private validateRequiredFields(
    fields: ChallanTemplateField[],
    customFields: Record<string, ICustomField>,
  ): void {
    const missingRequiredFields = fields
      .filter(
        (field) =>
          field.isRequired &&
          (!customFields[field.id] ||
            !customFields[field.id].value ||
            customFields[field.id].value.trim() === ''),
      )
      .map((field) => field.label || field.id);

    if (missingRequiredFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingRequiredFields.join(', ')}`,
      );
    }
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

    if (!fields || fields.length === 0) {
      throw new Error('No template fields found for the specified template');
    }

    if (!data.customFields) {
      data.customFields = {};
    }

    // Validate required fields
    this.validateRequiredFields(fields, data.customFields);

    // Initialize missing number fields with zero
    fields.forEach((field) => {
      if (
        field.type === FieldType.NUMBER &&
        (!data.customFields?.[field.id] ||
          !data.customFields?.[field.id]?.value)
      ) {
        // Ensure data.customFields is initialized
        if (!data.customFields) {
          data.customFields = {};
        }
        data.customFields[field.id] = { value: '0' };
      }
    });

    // Evaluate all formulas in the correct dependency order
    data.customFields = evaluateFormulaFields(fields, data.customFields);

    // Pass data directly (customFields is now Record<string, ...>)
    return this.repository.create({
      ...data,
      date: dateObject,
    });
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findManyByIds(ids: string[]) {
    return this.repository.findManyByIds(ids);
  }

  async getChallansByTemplateId(
    templateId: string,
    role: UserRole,
    filters?: IChallanFilter,
  ) {
    const result = await this.repository.getChallansByTemplateId(
      templateId,
      role,
      filters,
    );

    if (!result) {
      throw new Error('Record template not found');
    }

    return result;
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

    if (!fields || fields.length === 0) {
      throw new Error('No template fields found for the specified template');
    }

    if (data.customFields) {
      // Initialize missing number fields with zero
      fields.forEach((field) => {
        if (
          field.type === FieldType.NUMBER &&
          (!data.customFields?.[field.id] ||
            !data.customFields?.[field.id]?.value)
        ) {
          // Ensure data.customFields is initialized
          if (!data.customFields) {
            data.customFields = {};
          }
          data.customFields[field.id] = { value: '0' };
        }
      });

      // Evaluate all formulas in the correct dependency order
      data.customFields = evaluateFormulaFields(fields, data.customFields);

      // Validate required fields after formula evaluation
      this.validateRequiredFields(fields, data.customFields);
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

  async bulkDelete(ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('No challan IDs provided for bulk delete');
    }

    return this.repository.bulkDelete(ids);
  }
}
