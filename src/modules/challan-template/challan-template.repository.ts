import { PrismaClient, TransactionType } from '@prisma/client';
import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
  IChallanTemplateField,
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

  async findAll(orgId: string, transactionType?: TransactionType) {
    return this.prisma.challanTemplate.findMany({
      where: { orgId, ...(transactionType && { transactionType }) },
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

    // Step 1: Update the template basic data and relations
    const updatedTemplate = await this.prisma.challanTemplate.update({
      where: { id },
      data: {
        ...updateData,
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

    // If no field schema updates, return the updated template
    if (!fieldSchema || fieldSchema.length === 0) {
      return updatedTemplate;
    }

    // Step 2: Update existing fields
    const existingFields = fieldSchema.filter(
      (field) => field.id && field.id !== null && field.id !== '',
    );
    for (const field of existingFields) {
      await this.prisma.challanTemplateField.update({
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
          accessLevel: field.accessLevel,
        },
      });
    }

    // Step 3: Delete fields that are not in the update

    await this.prisma.challanTemplateField.deleteMany({
      where: {
        templateId: id,
        ...(fieldSchema &&
          fieldSchema.length > 0 && {
            id: {
              notIn: existingFields.map((field) => field.id as string),
            },
          }),
      },
    });

    // Step 4: Create new fields
    const newFields = fieldSchema.filter(
      (field) => !field.id || field.id === null || field.id === '',
    );
    if (newFields.length > 0) {
      await this.prisma.challanTemplateField.createMany({
        data: newFields.map(({ id, ...field }) => ({
          ...field,
          templateId: updatedTemplate.id,
        })),
      });
    }

    // Return the fully updated template
    return this.findById(updatedTemplate.id, updatedTemplate.orgId);
  }

  async delete(id: string) {
    return this.prisma.challanTemplate.delete({
      where: { id },
    });
  }
}
