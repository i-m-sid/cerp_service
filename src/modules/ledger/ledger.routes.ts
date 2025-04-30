import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LedgerController } from './ledger.controller';
import {
  ICreateLedgerAccount,
  IUpdateLedgerAccount,
  ICreateLedgerAccountCategory,
  IUpdateLedgerAccountCategory,
} from './ledger.interface';
import { authMiddleware } from '../../middleware/auth.middleware';
import { LedgerAccountType } from '@prisma/client';

export async function ledgerRoutes(fastify: FastifyInstance) {
  const controller = new LedgerController();

  // Ledger Account Category routes
  fastify.route({
    method: 'POST',
    url: '/category',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateLedgerAccountCategory }>,
      reply: FastifyReply,
    ) => controller.createCategory(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/category',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Querystring: {
          accountType?: LedgerAccountType;
          includeDefaults?: boolean;
        };
      }>,
      reply: FastifyReply,
    ) => controller.findAllCategories(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/category/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findCategoryById(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/category/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateLedgerAccountCategory, 'id'>;
      }>,
      reply: FastifyReply,
    ) => controller.updateCategory(req, reply),
  });

  fastify.route({
    method: 'DELETE',
    url: '/category/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.deleteCategory(req, reply),
  });

  // Ledger Account routes
  fastify.route({
    method: 'POST',
    url: '/account',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateLedgerAccount }>,
      reply: FastifyReply,
    ) => controller.createAccount(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/account',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Querystring: {
          categoryId?: string;
          partyId?: string;
        };
      }>,
      reply: FastifyReply,
    ) => controller.findAllAccounts(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/account/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.findAccountById(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/account/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateLedgerAccount, 'id'>;
      }>,
      reply: FastifyReply,
    ) => controller.updateAccount(req, reply),
  });

  fastify.route({
    method: 'DELETE',
    url: '/account/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.deleteAccount(req, reply),
  });
}
