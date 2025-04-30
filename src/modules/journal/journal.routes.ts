import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JournalController } from './journal.controller';
import { ICreateJournal, IUpdateJournal } from './journal.interface';
import { authMiddleware } from '../../middleware/auth.middleware';
import { SourceType, VoucherType, JournalStatus } from '@prisma/client';

export async function journalRoutes(fastify: FastifyInstance) {
  const controller = new JournalController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateJournal }>,
      reply: FastifyReply,
    ) => controller.create(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Querystring: {
          startDate?: string;
          endDate?: string;
          source?: SourceType;
          voucherType?: VoucherType;
          status?: JournalStatus;
        };
      }>,
      reply: FastifyReply,
    ) => controller.findAll(req, reply),
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
        Body: Omit<IUpdateJournal, 'id'>;
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
