import { FastifyReply, FastifyRequest } from 'fastify';
import { ItemService } from './item.service';
import { ICreateItem, IUpdateItem } from './item.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class ItemController {
  private service: ItemService;

  constructor() {
    this.service = new ItemService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreateItem, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const item = await this.service.create({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, item);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create item');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const items = await this.service.findAll(request.user!.orgId!);
      return sendSuccessResponse(reply, 200, items);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch items');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const item = await this.service.findById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!item) {
        return sendErrorResponse(reply, 404, null, 'Item not found');
      }
      return sendSuccessResponse(reply, 200, item);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch item');
    }
  }

  async findByCategoryId(
    request: FastifyRequest<{ Params: { categoryId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const items = await this.service.findByCategoryId(
        request.params.categoryId,
        request.user!.orgId!,
      );
      return sendSuccessResponse(reply, 200, items);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch items by category',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateItem, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const item = await this.service.update({
        id: request.params.id,
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 200, item);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update item');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const item = await this.service.delete(request.params.id);
      if (!item) {
        return sendErrorResponse(reply, 404, null, 'Item not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Item deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete item');
    }
  }
}
