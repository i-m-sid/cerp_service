import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanTemplateService } from './challan-template.service';
import {
  ICreateChallanTemplate,
  IUpdateChallanTemplate,
} from './challan-template.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { filterTemplateFieldsByRole } from './challan-template.util';
import { UserRole } from '@prisma/client';
export class ChallanTemplateController {
  private service: ChallanTemplateService;

  constructor() {
    this.service = new ChallanTemplateService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallanTemplate }>,
    reply: FastifyReply,
  ) {
    try {
      const template = await this.service.create(
        request.body,
        request.user!.orgId!,
      );
      const filteredTemplate = filterTemplateFieldsByRole(
        template,
        request.user!.role as UserRole,
      );
      return sendSuccessResponse(reply, 201, filteredTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create template');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const templates = await this.service.findAll(request.user!.orgId!);
      const filteredTemplates = templates.map((template) =>
        filterTemplateFieldsByRole(template, request.user!.role as UserRole),
      );
      return sendSuccessResponse(reply, 200, filteredTemplates);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch templates');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const template = await this.service.findById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!template) {
        return sendErrorResponse(reply, 404, null, 'Template not found');
      }
      const filteredTemplate = filterTemplateFieldsByRole(
        template,
        request.user!.role as UserRole,
      );
      return sendSuccessResponse(reply, 200, filteredTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch template');
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateChallanTemplate, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const template = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      const filteredTemplate = filterTemplateFieldsByRole(
        template!,
        request.user!.role as UserRole,
      );
      return sendSuccessResponse(reply, 200, filteredTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update template');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const template = await this.service.delete(request.params.id);
      if (!template) {
        return sendErrorResponse(reply, 404, null, 'Template not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Template deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete template');
    }
  }
}
