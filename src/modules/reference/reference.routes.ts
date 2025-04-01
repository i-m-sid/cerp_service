import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReferenceController } from './reference.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function referenceRoutes(fastify: FastifyInstance) {
  const controller = new ReferenceController();

  fastify.route({
    method: 'GET',
    url: '',
    preHandler: [authMiddleware],
    handler: async (req: FastifyRequest, reply: FastifyReply) =>
      controller.getTableReferences(req, reply),
  });
}
