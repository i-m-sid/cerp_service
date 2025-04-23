import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChallanController } from './challan.controller';
import {
  ICreateChallan,
  IUpdateChallan,
  IBulkUpdateChallans,
  IBulkDeleteChallans,
} from './challan.interface';
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
      req: FastifyRequest<{
        Params: { templateId: string };
        Querystring: {
          startDate?: string;
          endDate?: string;
          partyId?: string;
        };
      }>,
      reply: FastifyReply,
    ) => controller.getChallansByTemplateId(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/update',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: IBulkUpdateChallans }>,
      reply: FastifyReply,
    ) => controller.bulkUpdate(req, reply),
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

  fastify.route({
    method: 'DELETE',
    url: '/delete',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: IBulkDeleteChallans }>,
      reply: FastifyReply,
    ) => controller.bulkDelete(req, reply),
  });
}
