import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanRecordTemplateService } from './challan-record-template.service';
import {
  ICreateChallanRecordTemplate,
  IUpdateChallanRecordTemplate,
} from './challan-record-template.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
export class ChallanRecordTemplateController {
  private service: ChallanRecordTemplateService;

  constructor() {
    this.service = new ChallanRecordTemplateService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallanRecordTemplate }>,
    reply: FastifyReply,
  ) {
    try {
      console.log(request.body);
      const recordTemplate = await this.service.create(request.body);
      return sendSuccessResponse(reply, 201, recordTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create record template',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const recordTemplates = await this.service.findAll();
      return sendSuccessResponse(reply, 200, recordTemplates);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch record templates',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const recordTemplate = await this.service.findById(request.params.id);
      if (!recordTemplate) {
        return sendErrorResponse(reply, 404, null, 'Record template not found');
      }
      return sendSuccessResponse(reply, 200, recordTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch record template',
      );
    }
  }

  async findByTemplateId(
    request: FastifyRequest<{ Params: { templateId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const recordTemplates = await this.service.findByTemplateId(
        request.params.templateId,
      );
      return sendSuccessResponse(reply, 200, recordTemplates);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch record templates by template',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateChallanRecordTemplate, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      console.log(request.body);
      const updatedRecordTemplate = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      if (!updatedRecordTemplate) {
        return sendErrorResponse(reply, 404, null, 'Record template not found');
      }
      console.log(updatedRecordTemplate);
      return sendSuccessResponse(reply, 200, updatedRecordTemplate);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update record template',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const recordTemplate = await this.service.delete(request.params.id);
      if (!recordTemplate) {
        return sendErrorResponse(reply, 404, null, 'Record template not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Record template deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete record template',
      );
    }
  }
}
