import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UOMController } from './uom.controller';
import { ICreateUOM, IUpdateUOM } from './uom.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function uomRoutes(fastify: FastifyInstance) {
  const controller = new UOMController();

  fastify.route({
    method: 'GET',
    url: '/base-uoms',
    handler: async (req: FastifyRequest, reply: FastifyReply) =>
      controller.fetchBaseUOMs(req, reply),
  });

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateUOM }>,
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
        Body: Omit<IUpdateUOM, 'id'>;
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
