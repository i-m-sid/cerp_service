import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import {
  IChallanFilter,
  ICreateChallan,
  ICustomField,
  IUpdateChallan,
} from './challan.interface';

export class ChallanRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ICreateChallan) {
    // Ignoring customerId error as requested
    const createData: Prisma.ChallanCreateInput = {
      challanNumber: data.challanNumber,
      date: data.date || new Date(),
      customFields: data.customFields as unknown as Prisma.JsonObject, // Use new helper
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
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
    };
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
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
    };
  }

  async findManyByIds(ids: string[]) {
    const results = await this.prisma.challan.findMany({
      where: { id: { in: ids } },
      include: {
        status: true,
        template: true,
      },
    });
    return results.map((result) => ({
      ...result,
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
    }));
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
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
    }));
  }

  async update(data: IUpdateChallan) {
    const { id, ...updateFields } = data;

    const updateData: Prisma.ChallanUpdateInput = {
      challanNumber: updateFields.challanNumber,
      date: updateFields.date,
      customFields:
        updateFields.customFields !== undefined
          ? (updateFields.customFields as unknown as Prisma.JsonObject)
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
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
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
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
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

  // TODO: filter by role
  async getChallansByTemplateId(
    templateId: string,
    role: UserRole,
    filters?: IChallanFilter,
  ) {
    // First get the record template with its fields
    const recordTemplate: Record<string, string[]> = {};

    if (!recordTemplate) {
      return null;
    }

    // Build where clause for challans query
    const whereClause: Prisma.ChallanWhereInput = {
      templateId: templateId,
    };

    // Add date filter if provided
    if (filters?.startDate || filters?.endDate) {
      whereClause.date = {};

      if (filters.startDate) {
        whereClause.date.gte = filters.startDate;
      }

      if (filters.endDate) {
        whereClause.date.lte = filters.endDate;
      }
    }

    // Add partyId filter if provided
    if (filters?.partyId) {
      // First find the template field that represents the party
      const partyField = await this.prisma.challanTemplateField.findFirst({
        where: {
          templateId: templateId,
          refModel: 'party',
          refKey: {
            in: ['tradeName', 'legalName'],
          },
        },
      });

      if (partyField) {
        // Now filter challans where the customField matching this field ID has the party ID
        // PartyId is always stored in the id field
        whereClause.customFields = {
          path: [`$.${partyField.id}.id`],
          equals: filters.partyId,
        };
      } else {
        console.warn(`No party field found for template ${templateId}`);
      }
    }

    // Get all challans for this template with customFields
    const challans = await this.prisma.challan.findMany({
      where: whereClause,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        status: true,
        template: true,
      },
    });

    return challans.map((challan) => ({
      ...challan,
      customFields: challan.customFields as Record<string, any>,
    }));
  }
}
