import { PrismaClient, Prisma } from '@prisma/client';
import {
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
} from './challan.interface';

export class ChallanRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Renamed and simplified helpers
  private objectToJson(
    obj?: Record<string, ICustomField>,
  ): Prisma.JsonObject | typeof Prisma.JsonNull {
    if (!obj || Object.keys(obj).length === 0) {
      return Prisma.JsonNull;
    }
    // The object is already in the correct format for Prisma
    return obj as unknown as Prisma.JsonObject;
  }

  private jsonToObject(
    json?: Prisma.JsonValue | null,
  ): Record<string, ICustomField> {
    const obj: Record<string, ICustomField> = {};
    if (json && typeof json === 'object' && !Array.isArray(json)) {
      for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
          const value = json[key];
          if (value !== null && typeof value === 'object' && 'value' in value) {
            // Assume structure matches ICustomField
            obj[key] = value as unknown as ICustomField;
          } else {
            console.warn(`Skipping invalid custom field data for key: ${key}`);
          }
        }
      }
    }
    return obj;
  }

  async create(data: ICreateChallan) {
    // Ignoring customerId error as requested
    const createData: Prisma.ChallanCreateInput = {
      challanNumber: data.challanNumber,
      date: data.date || new Date(),
      customFields: this.objectToJson(data.customFields), // Use new helper
      status: {
        connect: { id: data.statusId },
      },
      template: {
        connect: { id: data.templateId },
      },
      // customerId: data.customerId, // Ignored
    };

    const result = await this.prisma.challan.create({
      data: createData,
      include: {
        status: true,
        template: true,
      },
    });

    return {
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    };
  }

  async findAll() {
    const results = await this.prisma.challan.findMany({
      include: {
        status: true,
        template: true,
      },
    });

    return results.map((result) => ({
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    }));
  }

  async findById(id: string) {
    const result = await this.prisma.challan.findUnique({
      where: { id },
      include: {
        status: true,
        template: true,
      },
    });

    if (!result) return null;

    return {
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    };
  }

  async findByTemplateId(templateId: string) {
    const results = await this.prisma.challan.findMany({
      where: { templateId },
      include: {
        status: true,
        template: true,
      },
    });

    return results.map((result) => ({
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    }));
  }

  async update(data: IUpdateChallan) {
    const { id, ...updateFields } = data;

    const updateData: Prisma.ChallanUpdateInput = {
      challanNumber: updateFields.challanNumber,
      date: updateFields.date,
      customFields:
        updateFields.customFields !== undefined
          ? this.objectToJson(updateFields.customFields) // Use new helper
          : undefined,
      ...(updateFields.statusId && {
        status: {
          connect: { id: updateFields.statusId },
        },
      }),
      ...(updateFields.templateId && {
        template: {
          connect: { id: updateFields.templateId },
        },
      }),
    };

    const result = await this.prisma.challan.update({
      where: { id },
      data: updateData,
      include: {
        status: true,
        template: true,
      },
    });

    return {
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    };
  }

  async bulkUpdate(challans: IUpdateChallan[]) {
    // Using Promise.all for parallel processing
    const updatePromises = challans.map(async (challan) => {
      try {
        const updatedChallan = await this.update(challan);
        return { success: true, data: updatedChallan, id: challan.id };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error',
          id: challan.id,
        };
      }
    });

    return Promise.all(updatePromises);
  }

  async delete(id: string) {
    const result = await this.prisma.challan.delete({
      where: { id },
    });

    return {
      ...result,
      customFields: this.jsonToObject(result.customFields), // Use new helper
    };
  }

  async bulkDelete(ids: string[]) {
    // Using Promise.all for parallel processing
    const deletePromises = ids.map(async (id) => {
      try {
        const deletedChallan = await this.delete(id);
        return { success: true, data: deletedChallan, id };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error',
          id,
        };
      }
    });

    return Promise.all(deletePromises);
  }
}
