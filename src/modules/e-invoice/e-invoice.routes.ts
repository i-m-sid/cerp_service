import { UserRole } from '@prisma/client';
import { requireRole } from '../../middleware/auth.middleware';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { EInvoiceController } from './e-invoice.controller';
import { ICreateEInvoice } from './e-invoice.interface';

export async function eInvoiceRoutes(fastify: FastifyInstance) {
  const controller = new EInvoiceController();

  // Create e-invoice json
  fastify.route({
    method: 'POST',
    url: '/json',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Body: ICreateEInvoice }>,
      reply: FastifyReply,
    ) => controller.generateEInvoiceV2(req, reply),
  });
}
