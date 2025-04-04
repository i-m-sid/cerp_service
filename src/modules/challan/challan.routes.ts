import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChallanController } from './challan.controller';
import { ICreateChallan, IUpdateChallan } from './challan.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function challanRoutes(fastify: FastifyInstance) {
  const controller = new ChallanController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateChallan }>,
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
    method: 'GET',
    url: '/template/:templateId',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { templateId: string } }>,
      reply: FastifyReply,
    ) => controller.findByTemplateId(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateChallan, 'id'>;
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
