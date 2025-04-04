import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanService } from './challan.service';
import { ICreateChallan, IUpdateChallan } from './challan.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class ChallanController {
  private service: ChallanService;

  constructor() {
    this.service = new ChallanService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallan }>,
    reply: FastifyReply,
  ) {
    console.log(request.body);
    try {
      const challan = await this.service.create(request.body);
      return sendSuccessResponse(reply, 201, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create challan');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const challans = await this.service.findAll();
      return sendSuccessResponse(reply, 200, challans);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch challans');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const challan = await this.service.findById(request.params.id);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch challan');
    }
  }

  async findByTemplateId(
    request: FastifyRequest<{ Params: { templateId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const challans = await this.service.findByTemplateId(
        request.params.templateId,
      );
      return sendSuccessResponse(reply, 200, challans);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch challans by template',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateChallan, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const updateData: IUpdateChallan = {
        ...request.body,
        id: request.params.id,
      };
      const challan = await this.service.update(updateData);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update challan');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const challan = await this.service.delete(request.params.id);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Challan deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete challan');
    }
  }
}
