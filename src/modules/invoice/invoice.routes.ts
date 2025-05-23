import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InvoiceController } from './invoice.controller';
import {
  ICreateInvoice,
  IUpdateInvoice,
  IBulkUpdateInvoices,
  IBulkDeleteInvoices,
} from './invoice.interface';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { InvoiceType, TransactionType } from '@prisma/client';
import { UserRole } from '@prisma/client';

export async function invoiceRoutes(fastify: FastifyInstance) {
  const controller = new InvoiceController();

  // Create invoice
  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Body: ICreateInvoice }>,
      reply: FastifyReply,
    ) => controller.create(req, reply),
  });

  // Get all invoices or filter by type
  fastify.route({
    method: 'GET',
    url: '',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{
        Querystring: {
          transactionType?: TransactionType;
          invoiceType?: InvoiceType;
          startDate?: string;
          endDate?: string;
          partyId?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      return controller.findAll(req, reply);
    },
  });

  // Get invoice by ID
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findById(req, reply),
  });

  // Get invoices by customer ID
  fastify.route({
    method: 'GET',
    url: '/customer/:customerId',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Params: { customerId: string } }>,
      reply: FastifyReply,
    ) => controller.findByCustomerId(req, reply),
  });

  // Update invoice by ID
  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateInvoice, 'id'>;
      }>,
      reply: FastifyReply,
    ) => controller.update(req, reply),
  });

  // Delete invoice by ID
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.delete(req, reply),
  });

  // Bulk delete invoices
  fastify.route({
    method: 'DELETE',
    url: '/delete',
    preHandler: [authMiddleware, requireRole(UserRole.ACCOUNTANT)],
    handler: async (
      req: FastifyRequest<{ Body: IBulkDeleteInvoices }>,
      reply: FastifyReply,
    ) => controller.bulkDelete(req, reply),
  });
}
