import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanStatusService } from './challan-status.service';
import {
  ICreateChallanStatus,
  IUpdateChallanStatus,
} from './challan-status.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class ChallanStatusController {
  private service: ChallanStatusService;

  constructor() {
    this.service = new ChallanStatusService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallanStatus }>,
    reply: FastifyReply,
  ) {
    try {
      const status = await this.service.create(request.body, request.user!.orgId!);
      return sendSuccessResponse(reply, 201, status);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create challan status',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const statuses = await this.service.findAll(request.user!.orgId!);
      return sendSuccessResponse(reply, 200, statuses);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch challan statuses',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const status = await this.service.findById(request.params.id, request.user!.orgId!);
      if (!status) {
        return sendErrorResponse(reply, 404, null, 'Challan status not found');
      }
      return sendSuccessResponse(reply, 200, status);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch challan status',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: IUpdateChallanStatus;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const status = await this.service.update(request.params.id, request.body, request.user!.orgId!);
      if (!status) {
        return sendErrorResponse(reply, 404, null, 'Challan status not found');
      }
      return sendSuccessResponse(reply, 200, status);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update challan status',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const status = await this.service.delete(request.params.id, request.user!.orgId!);
      if (!status) {
        return sendErrorResponse(reply, 404, null, 'Challan status not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Challan status deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete challan status',
      );
    }
  }
}
