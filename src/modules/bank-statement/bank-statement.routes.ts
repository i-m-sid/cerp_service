import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BankStatementController } from './bank-statement.controller';
import {
  ICreateBankStatement,
  IUpdateBankStatement,
  IReconcileBankStatementEntry,
} from './bank-statement.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function bankStatementRoutes(fastify: FastifyInstance) {
  const controller = new BankStatementController();

  // Create bank statement
  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateBankStatement }>,
      reply: FastifyReply,
    ) => controller.create(req, reply),
  });

  // Get all bank statements
  fastify.route({
    method: 'GET',
    url: '',
    preHandler: [authMiddleware],
    handler: async (req: FastifyRequest, reply: FastifyReply) =>
      controller.findAll(req, reply),
  });

  // Get bank statement by ID
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findById(req, reply),
  });

  // Get bank statements by account ID
  fastify.route({
    method: 'GET',
    url: '/account/:accountId',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { accountId: string } }>,
      reply: FastifyReply,
    ) => controller.findByAccountId(req, reply),
  });

  // Update bank statement
  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateBankStatement, 'id'>;
      }>,
      reply: FastifyReply,
    ) => controller.update(req, reply),
  });

  // Delete bank statement
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.delete(req, reply),
  });

  // Reconcile bank statement entry
  fastify.route({
    method: 'POST',
    url: '/entry/reconcile',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: IReconcileBankStatementEntry }>,
      reply: FastifyReply,
    ) => controller.reconcileEntry(req, reply),
  });

  // Unreconcile bank statement entry
  fastify.route({
    method: 'POST',
    url: '/entry/unreconcile/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.unreconcileEntry(req, reply),
  });
}
