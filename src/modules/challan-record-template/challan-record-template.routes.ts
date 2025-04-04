import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChallanRecordTemplateController } from './challan-record-template.controller';
import {
  ICreateChallanRecordTemplate,
  IUpdateChallanRecordTemplate,
} from './challan-record-template.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function challanRecordTemplateRoutes(fastify: FastifyInstance) {
  const controller = new ChallanRecordTemplateController();

  fastify.route({
    method: 'POST',
    url: '',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Body: ICreateChallanRecordTemplate }>,
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
    url: '/template/:templateId',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { templateId: string } }>,
      reply: FastifyReply,
    ) => controller.findByTemplateId(req, reply),
  });

  fastify.route({
    method: 'GET',
    url: '/:id/challans',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => controller.getChallansByRecordTemplate(req, reply),
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [authMiddleware],
    handler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: Omit<IUpdateChallanRecordTemplate, 'id'>;
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
