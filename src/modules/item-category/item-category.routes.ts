import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ItemCategoryController } from './item-category.controller';
import {
  ICreateItemCategory,
  IUpdateItemCategory,
} from './item-category.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function itemCategoryRoutes(fastify: FastifyInstance) {
  const controller = new ItemCategoryController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateItemCategory }>,
      reply: FastifyReply,
    ) => controller.create(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '',
    preHandler: [authMiddleware],
    handler: async (req: FastifyRequest, reply: FastifyReply) =>
      controller.findAll(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findById(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateItemCategory, 'id'>;
      }>,
      reply: FastifyReply,
    ) => controller.update(req, reply),
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.delete(req, reply),
  });
}
