import { FastifyInstance } from 'fastify';
import { OrganizationController } from './organization.controller';
import { requireRole, authMiddleware } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const controller = new OrganizationController();

export async function organizationRoutes(fastify: FastifyInstance) {
  // Organization routes
  fastify.post('/', {
    preHandler: [authMiddleware],
    handler: controller.create.bind(controller),
  });

  fastify.get('/', {
    preHandler: [authMiddleware],
    handler: controller.findAll.bind(controller),
  });

  fastify.get('/:orgId', {
    preHandler: [authMiddleware],
    handler: controller.findById.bind(controller),
  });

  fastify.put('/:orgId', {
    preHandler: [authMiddleware, requireRole(UserRole.ADMIN)],
    handler: controller.update.bind(controller),
  });

  fastify.delete('/:orgId', {
    preHandler: [authMiddleware, requireRole(UserRole.OWNER)],
    handler: controller.delete.bind(controller),
  });
}
