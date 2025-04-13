import { PrismaClient, ChallanTemplateField, UserRole } from '@prisma/client';
import {
  ICreateChallanRecordTemplate,
  IUpdateChallanRecordTemplate,
} from './challan-record-template.interface';

export class ChallanRecordTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly include = {
    template: true,
    fields: true,
  };

  async create(data: ICreateChallanRecordTemplate) {
    const { fieldIds, ...recordTemplateData } = data;

    return this.prisma.challanRecordTemplate.create({
      data: {
        ...recordTemplateData,
        fields: {
          connect: fieldIds.map((id) => ({ id })),
        },
      },
      include: this.include,
    });
  }

  async findAll() {
    return this.prisma.challanRecordTemplate.findMany({
      include: this.include,
    });
  }

  async findById(id: string) {
    return this.prisma.challanRecordTemplate.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findByTemplateId(templateId: string) {
    return this.prisma.challanRecordTemplate.findMany({
      where: { templateId },
      include: this.include,
    });
  }

  async update(data: IUpdateChallanRecordTemplate) {
    const { id, fieldIds, ...updateData } = data;

    return this.prisma.challanRecordTemplate.update({
      where: { id },
      data: {
        ...updateData,
        ...(fieldIds && {
          fields: {
            set: [],
            connect: fieldIds.map((id) => ({ id })),
          },
        }),
      },
      include: this.include,
    });
  }

  async delete(id: string) {
    return this.prisma.challanRecordTemplate.delete({
      where: { id },
    });
  }

  // TODO: filter by role
  async getChallansByRecordTemplate(recordTemplateId: string, role: UserRole) {
    // First get the record template with its fields
    const recordTemplate = await this.prisma.challanRecordTemplate.findUnique({
      where: { id: recordTemplateId },
      include: this.include,
    });

    if (!recordTemplate) {
      return null;
    }

    // Get all challans for this template with customFields
    const challans = await this.prisma.challan.findMany({
      where: { templateId: recordTemplate.templateId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        status: true,
        template: true,
      },
    });

    // Filter custom fields based on record template fields
    const fieldLabels = recordTemplate.fields.map(
      (field: ChallanTemplateField) => field.label,
    );

    return {
      recordTemplate,
      challans: challans.map((challan) => ({
        ...challan,
        customFields: challan.customFields as Record<string, any>,
      })),
    };
  }
}
