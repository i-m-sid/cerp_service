import { FastifyReply, FastifyRequest } from 'fastify';
import { ItemCategoryService } from './item-category.service';
import {
  ICreateItemCategory,
  IUpdateItemCategory,
} from './item-category.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class ItemCategoryController {
  private service: ItemCategoryService;

  constructor() {
    this.service = new ItemCategoryService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreateItemCategory, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.create({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create item category',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.service.findAll(request.user!.orgId!);
      return sendSuccessResponse(reply, 200, categories);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch item categories',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.findById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!category) {
        return sendErrorResponse(reply, 404, null, 'Item category not found');
      }
      return sendSuccessResponse(reply, 200, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch item category',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateItemCategory, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update item category',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.delete(request.params.id);
      if (!category) {
        return sendErrorResponse(reply, 404, null, 'Item category not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Item category deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete item category',
      );
    }
  }
}
