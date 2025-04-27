import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
  IBulkUpdateChallans,
  IChallanFilter,
  IChallan,
} from './challan.interface';
import { ChallanRepository } from './challan.repository';
import {
  ChallanTemplateField,
  PrismaClient,
  FieldType,
  UserRole,
} from '@prisma/client';
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

  async create(data: ICreateChallan, orgId: string) {
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
    return this.repository.create(
      {
        ...data,
        date: dateObject,
      },
      orgId,
    );
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findManyByIds(ids: string[], orgId: string) {
    return this.repository.findManyByIds(ids, orgId);
  }

  async getChallansByTemplateId(
    templateId: string,
    orgId: string,
    role: UserRole,
    filters?: IChallanFilter,
  ) {
    const result = await this.repository.getChallansByTemplateId(
      templateId,
      orgId,
      role,
      filters,
    );

    if (!result) {
      throw new Error('Record template not found');
    }

    return result;
  }

  /**
   * Prepares a challan update by processing dates, custom fields, and formulas
   */
  private prepareChallanUpdate(
    data: IUpdateChallan,
    fields: ChallanTemplateField[],
  ): IUpdateChallan {
    const dateObject =
      typeof data.date === 'string' ? new Date(data.date) : data.date;

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

    return {
      ...data,
      date: dateObject,
    };
  }

  async update(data: IUpdateChallan, orgId: string) {
    const fieldSchema = await this.prisma.challanTemplateField.findMany({
      where: {
        templateId: data.templateId,
      },
    });
    const processedData = this.prepareChallanUpdate(data, fieldSchema);
    return this.repository.update(processedData, orgId);
  }

  async bulkUpdate(data: IBulkUpdateChallans, orgId: string) {
    const { challans } = data;

    if (!challans || !Array.isArray(challans) || challans.length === 0) {
      throw new Error('No challans provided for bulk update');
    }

    // Get field schema once for all challans
    const fieldSchema = await this.prisma.challanTemplateField.findMany({
      where: {
        templateId: challans[0].templateId,
      },
    });

    // Process all challans in parallel using the common method
    const processedChallans = challans.map((challan) =>
      this.prepareChallanUpdate(challan, fieldSchema),
    );

    console.log(
      'processedChallans',
      JSON.stringify(processedChallans, null, 2),
    );

    // Use repository's optimized bulkUpdate
    return this.repository.bulkUpdate(processedChallans, orgId);
  }

  async delete(id: string, orgId: string) {
    return this.repository.delete(id, orgId);
  }

  async bulkDelete(ids: string[], orgId: string) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('No challan IDs provided for bulk delete');
    }

    return this.repository.bulkDelete(ids, orgId);
  }
}
