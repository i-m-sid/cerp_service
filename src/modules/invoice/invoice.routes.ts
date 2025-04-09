import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InvoiceController } from './invoice.controller';
import {
  ICreateInvoice,
  IUpdateInvoice,
  IBulkUpdateInvoices,
} from './invoice.interface';
import { authMiddleware } from '../../middleware/auth.middleware';
import { InvoiceType, TransactionType } from '@prisma/client';

export async function invoiceRoutes(fastify: FastifyInstance) {
  const controller = new InvoiceController();

  // Create invoice
  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateInvoice }>,
      reply: FastifyReply,
    ) => controller.create(req, reply),
  });

  // Get all invoices or filter by type
  fastify.route({
    method: 'GET',
    url: '',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          transactionType: {
            type: 'string',
            enum: Object.values(TransactionType),
          },
          invoiceType: { type: 'string', enum: Object.values(InvoiceType) },
        },
      },
    },
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Querystring: {
          transactionType?: TransactionType;
          invoiceType?: InvoiceType;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const { transactionType, invoiceType } = req.query;
      if (transactionType || invoiceType) {
        return controller.findByTypes(req, reply);
      }
      return controller.findAll(req, reply);
    },
  });

  // Get invoice by ID
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findById(req, reply),
  });

  // Get invoices by customer ID
  fastify.route({
    method: 'GET',
    url: '/customer/:customerId',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { customerId: string } }>,
      reply: FastifyReply,
    ) => controller.findByCustomerId(req, reply),
  });

  // Bulk update invoices
  fastify.route({
    method: 'PUT',
    url: '/bulk',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: IBulkUpdateInvoices }>,
      reply: FastifyReply,
    ) => controller.bulkUpdate(req, reply),
  });

  // Update invoice by ID
  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
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
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.delete(req, reply),
  });
}
