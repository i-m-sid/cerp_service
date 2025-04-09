import { PrismaClient } from '@prisma/client';
import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
} from './challan-template.interface';

export class ChallanTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    fieldSchema: true,
    allowedPartyTypes: true,
    allowedItemCategories: true,
    allowedStatuses: true,
  };

  async create(data: ICreateChallanTemplate, orgId: string) {
    const {
      allowedPartyTypes,
      allowedItemCategories,
      allowedStatuses,
      ...templateData
    } = data;

    return this.prisma.challanTemplate.create({
      data: {
        ...templateData,
        organization: {
          connect: { id: orgId },
        },
        fieldSchema: {
          createMany: {
            data: templateData.fieldSchema,
          },
        },
        allowedStatuses: {
          connect: allowedStatuses.map((status) => ({
            id: status.id,
          })),
        },
        allowedPartyTypes: {
          connect: allowedPartyTypes.map((partyType) => ({
            id: partyType.id,
          })),
        },
        allowedItemCategories: {
          connect: allowedItemCategories.map((itemCategory) => ({
            id: itemCategory.id,
          })),
        },
      },
      include: this.include,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.challanTemplate.findMany({
      where: { orgId },
      include: this.include,
    });
  }

  async findById(id: string, orgId: string) {
    return this.prisma.challanTemplate.findUnique({
      where: { id, orgId },
      include: this.include,
    });
  }

  async clearRelations(
    id: string,
    options: { partyTypes?: boolean; itemCategories?: boolean },
  ) {
    return this.prisma.challanTemplate.update({
      where: { id },
      data: {
        ...(options.partyTypes && {
          allowedPartyTypes: { set: [] },
        }),
        ...(options.itemCategories && {
          allowedItemCategories: { set: [] },
        }),
      },
    });
  }

  async update(data: IUpdateChallanTemplate) {
    const {
      id,
      allowedPartyTypes,
      allowedItemCategories,
      fieldSchema,
      allowedStatuses,
      ...updateData
    } = data;

    // Handle field schema updates if provided
    const fieldSchemaUpdate = fieldSchema && {
      fieldSchema: {
        // Update existing fields
        update: fieldSchema
          .filter((field) => field.id)
          .map((field) => ({
            where: { id: field.id },
            data: {
              label: field.label,
              type: field.type,
              flex: field.flex,
              row: field.row,
              column: field.column,
              isRequired: field.isRequired,
              data: field.data,
              refModel: field.refModel,
              refKey: field.refKey,
              refId: field.refId,
              invoiceField: field.invoiceField,
              dependsOn: field.dependsOn,
            },
          })),
        // Create new fields
        createMany: {
          data: fieldSchema.filter((field) => !field.id),
        },
        // Delete fields that are not in the update
        deleteMany: {
          id: {
            notIn: fieldSchema
              .filter((field) => field.id)
              .map((field) => field.id as string),
          },
        },
      },
    };

    return this.prisma.challanTemplate.update({
      where: { id },
      data: {
        ...updateData,
        ...fieldSchemaUpdate,
        ...(allowedStatuses && {
          allowedStatuses: {
            connect: allowedStatuses.map((status) => ({
              id: status.id,
            })),
          },
        }),
        ...(allowedPartyTypes && {
          allowedPartyTypes: {
            connect: allowedPartyTypes.map((partyType) => ({
              id: partyType.id,
            })),
          },
        }),
        ...(allowedItemCategories && {
          allowedItemCategories: {
            connect: allowedItemCategories.map((itemCategory) => ({
              id: itemCategory.id,
            })),
          },
        }),
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.challanTemplate.delete({
      where: { id },
    });
  }
}
