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

  async create(data: ICreateChallan, orgId: string) {
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
      organization: {
        connect: { id: orgId },
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

  async findById(id: string, orgId: string) {
    const result = await this.prisma.challan.findUnique({
      where: { id, orgId },
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

  async findManyByIds(ids: string[], orgId: string) {
    const results = await this.prisma.challan.findMany({
      where: { id: { in: ids }, orgId },
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

  async findByTemplateId(templateId: string, orgId: string) {
    const results = await this.prisma.challan.findMany({
      where: { templateId, orgId },
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

  async update(data: IUpdateChallan, orgId: string) {
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

  /**
   * Bulk updates challans in parallel within a transaction.
   *
   * @param challans - Array of challan update objects
   * @param orgId - Organization ID
   * @returns Promise resolving to an array of update results for each challan
   */
  async bulkUpdate(challans: IUpdateChallan[], orgId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const updatePromises = challans.map(async (challan) => {
          try {
            const { id, ...updateFields } = challan;

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

            const result = await tx.challan.update({
              where: { id, orgId },
              data: updateData,
              include: {
                status: true,
                template: true,
              },
            });

            return {
              success: true,
              data: {
                ...result,
                customFields: result.customFields as unknown as Record<
                  string,
                  ICustomField
                >,
              },
              id: challan.id,
            };
          } catch (error: any) {
            console.log('error', error);
            return {
              success: false,
              error: error.message || 'Unknown error',
              id: challan.id,
            };
          }
        });
        return Promise.all(updatePromises);
      },
      { timeout: 100000 },
    );
  }

  async delete(id: string, orgId: string) {
    const result = await this.prisma.challan.delete({
      where: { id, orgId },
    });

    return {
      ...result,
      customFields: result.customFields as unknown as Record<
        string,
        ICustomField
      >,
    };
  }

  async bulkDelete(ids: string[], orgId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const deletePromises = ids.map(async (id) => {
          try {
            const result = await tx.challan.delete({
              where: { id, orgId },
            });

            return {
              success: true,
              data: {
                ...result,
                customFields: result.customFields as unknown as Record<
                  string,
                  ICustomField
                >,
              },
              id,
            };
          } catch (error: any) {
            return {
              success: false,
              error: error.message || 'Unknown error',
              id,
            };
          }
        });

        return Promise.all(deletePromises);
      },
      { timeout: 100000 },
    );
  }

  // TODO: filter by role
  async getChallansByTemplateId(
    templateId: string,
    orgId: string,
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
      orgId: orgId,
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
          refModel: 'Party',
          refId: 'id',
        },
      });

      if (partyField) {
        // Now filter challans where the customField matching this field ID has the party ID
        // PartyId is always stored in the id field
        whereClause.customFields = {
          path: [partyField.id, 'id'],
          equals: filters.partyId,
        };
      } else {
        console.warn(`No party field found for template ${templateId}`);
      }
    }

    // Get all challans for this template with customFields
    const challans = await this.prisma.challan.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
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
