import { FastifyReply, FastifyRequest } from 'fastify';
import { UOMService } from './uom.service';
import { ICreateUOM, IUpdateUOM, IInternalCreateUOM } from './uom.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class UOMController {
  private service: UOMService;

  constructor() {
    this.service = new UOMService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateUOM }>,
    reply: FastifyReply,
  ) {
    try {
      const internalData: IInternalCreateUOM = {
        ...request.body,
        createdBy: request.user!.userId,
      };
      const uom = await this.service.create(internalData);
      return sendSuccessResponse(reply, 201, uom);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create UOM');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const uoms = await this.service.findAll();
      return sendSuccessResponse(reply, 200, uoms);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch UOMs');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const uom = await this.service.findById(request.params.id);
      if (!uom) {
        return sendErrorResponse(reply, 404, null, 'UOM not found');
      }
      return sendSuccessResponse(reply, 200, uom);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch UOM');
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateUOM, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const uom = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, uom);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update UOM');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const uom = await this.service.delete(request.params.id);
      if (!uom) {
        return sendErrorResponse(reply, 404, null, 'UOM not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'UOM deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete UOM');
    }
  }
}
