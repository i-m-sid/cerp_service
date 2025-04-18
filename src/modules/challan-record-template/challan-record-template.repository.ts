import {
  PrismaClient,
  ChallanTemplateField,
  UserRole,
  Prisma,
} from '@prisma/client';
import {
  ICreateChallanRecordTemplate,
  IUpdateChallanRecordTemplate,
} from './challan-record-template.interface';
import { IChallanFilter } from '../challan-record/challan-record.service';

export class ChallanRecordTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    template: true,
    fields: true,
  } satisfies Prisma.ChallanRecordTemplateInclude;

  private sortFieldsByOrder(recordTemplate: any) {
    const sortedFields = [...recordTemplate.fields].sort((a, b) => {
      const aIndex = recordTemplate.fieldOrder?.indexOf(a.id) ?? -1;
      const bIndex = recordTemplate.fieldOrder?.indexOf(b.id) ?? -1;
      return aIndex - bIndex;
    });

    const { fieldOrder, ...recordTemplateWithoutOrder } = recordTemplate;
    return {
      ...recordTemplateWithoutOrder,
      fields: sortedFields,
    };
  }

  async create(data: ICreateChallanRecordTemplate) {
    const { fieldIds, ...recordTemplateData } = data;

    const createData: Prisma.ChallanRecordTemplateUncheckedCreateInput = {
      ...recordTemplateData,
      fieldOrder: fieldIds,
    };

    // Create record template first
    const recordTemplate = await this.prisma.challanRecordTemplate.create({
      data: createData,
    });

    // Then connect fields
    if (fieldIds.length > 0) {
      await this.prisma.challanRecordTemplate.update({
        where: { id: recordTemplate.id },
        data: {
          fields: {
            connect: fieldIds.map((id) => ({ id })),
          },
        },
      });
    }

    // Return with includes and sorted fields
    const result = await this.findById(recordTemplate.id);
    return result ? this.sortFieldsByOrder(result) : null;
  }

  async findAll() {
    const results = await this.prisma.challanRecordTemplate.findMany({
      include: this.include,
    });
    return results.map((result) => this.sortFieldsByOrder(result));
  }

  async findById(id: string) {
    const result = await this.prisma.challanRecordTemplate.findUnique({
      where: { id },
      include: this.include,
    });
    return result ? this.sortFieldsByOrder(result) : null;
  }

  async findByTemplateId(templateId: string) {
    const results = await this.prisma.challanRecordTemplate.findMany({
      where: { templateId },
      include: this.include,
    });
    return results.map((result) => this.sortFieldsByOrder(result));
  }

  async update(data: IUpdateChallanRecordTemplate) {
    const { id, fieldIds, ...updateData } = data;

    const prismaUpdateData: Prisma.ChallanRecordTemplateUncheckedUpdateInput = {
      ...updateData,
      ...(fieldIds && {
        fieldOrder: fieldIds,
      }),
    };

    // Update basic data first
    await this.prisma.challanRecordTemplate.update({
      where: { id },
      data: prismaUpdateData,
    });

    // Then update field connections if needed
    if (fieldIds) {
      await this.prisma.challanRecordTemplate.update({
        where: { id },
        data: {
          fields: {
            set: [],
            connect: fieldIds.map((id) => ({ id })),
          },
        },
      });
    }

    // Return with includes and sorted fields
    const result = await this.findById(id);
    return result ? this.sortFieldsByOrder(result) : null;
  }

  async delete(id: string) {
    return this.prisma.challanRecordTemplate.delete({
      where: { id },
    });
  }

  // TODO: filter by role
  async getChallansByRecordTemplate(
    recordTemplateId: string,
    role: UserRole,
    filters?: IChallanFilter,
  ) {
    // First get the record template with its fields
    const recordTemplate = await this.prisma.challanRecordTemplate.findUnique({
      where: { id: recordTemplateId },
      include: this.include,
    });

    if (!recordTemplate) {
      return null;
    }

    // Build where clause for challans query
    const whereClause: Prisma.ChallanWhereInput = {
      templateId: recordTemplate.templateId,
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
          templateId: recordTemplate.templateId,
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
        console.warn(
          `No party field found for template ${recordTemplate.templateId}`,
        );
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

    return {
      recordTemplate: this.sortFieldsByOrder(recordTemplate),
      challans: challans.map((challan) => ({
        ...challan,
        customFields: challan.customFields as Record<string, any>,
      })),
    };
  }
}
