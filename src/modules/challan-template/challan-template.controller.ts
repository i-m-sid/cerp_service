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

export class ChallanTemplateController {
  private service: ChallanTemplateService;

  constructor() {
    this.service = new ChallanTemplateService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallanTemplate }>,
    reply: FastifyReply,
  ) {
    console.log(request.body);
    console.log(request.user);
    try {
      const template = await this.service.create(
        request.body,
        request.user!.userId,
      );
      console.log(JSON.stringify(template, null, 2));
      return sendSuccessResponse(reply, 201, template);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create template');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const templates = await this.service.findAll();
      console.log(JSON.stringify(templates, null, 2));
      return sendSuccessResponse(reply, 200, templates);
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
      const template = await this.service.findById(request.params.id);
      if (!template) {
        return sendErrorResponse(reply, 404, null, 'Template not found');
      }
      return sendSuccessResponse(reply, 200, template);
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
    console.log(request.body);
    try {
      const template = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      console.log(JSON.stringify(template, null, 2));
      return sendSuccessResponse(reply, 200, template);
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
