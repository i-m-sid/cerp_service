import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CustomerController } from './customer.controller';
import { ICreateCustomer, IUpdateCustomer } from './customer.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function customerRoutes(fastify: FastifyInstance) {
  const controller = new CustomerController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateCustomer }>,
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
    url: '/type/:customerTypeId',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { customerTypeId: string } }>,
      reply: FastifyReply,
    ) => controller.findByCustomerType(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateCustomer, 'id'>;
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
