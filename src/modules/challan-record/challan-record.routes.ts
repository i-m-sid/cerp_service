import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChallanRecordController } from './challan-record.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function challanRecordRoutes(fastify: FastifyInstance) {
  const controller = new ChallanRecordController();

  fastify.route({
    method: 'GET',
    url: '/template/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Querystring: {
          startDate?: string;
          endDate?: string;
          partyId?: string;
        };
      }>,
      reply: FastifyReply,
    ) => controller.getChallansByRecordTemplate(req, reply),
  });
}
