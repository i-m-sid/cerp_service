import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VehicleController } from './vehicle.controller';
import { ICreateVehicle, IUpdateVehicle } from './vehicle.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function vehicleRoutes(fastify: FastifyInstance) {
  const controller = new VehicleController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateVehicle }>,
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
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateVehicle, 'id'>;
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
