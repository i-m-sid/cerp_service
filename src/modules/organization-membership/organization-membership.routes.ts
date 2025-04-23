import { FastifyInstance } from 'fastify';
import { OrganizationMembershipController } from './organization-membership.controller';
import { requireRole, authMiddleware } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const controller = new OrganizationMembershipController();

export async function organizationMembershipRoutes(fastify: FastifyInstance) {
  // All routes will use the orgId from the request query parameter
  // This is handled by the auth middleware which sets the orgId on the request.user object

  // Create a new membership
  fastify.post('/', {
    preHandler: [authMiddleware, requireRole(UserRole.ADMIN)],
    handler: controller.create.bind(controller),
  });

  // Get all memberships for the organization
  fastify.get('/', {
    preHandler: [authMiddleware, requireRole(UserRole.OWNER)],
    handler: controller.findAll.bind(controller),
  });

  // Get a specific membership by ID
  fastify.get('/:id', {
    preHandler: [authMiddleware, requireRole(UserRole.OWNER)],
    handler: controller.findById.bind(controller),
  });

  // Update a membership (e.g., change role)
  fastify.put('/:id', {
    preHandler: [authMiddleware, requireRole(UserRole.OWNER)],
    handler: controller.update.bind(controller),
  });

  // Delete a membership
  fastify.delete('/:id', {
    preHandler: [authMiddleware, requireRole(UserRole.OWNER)],
    handler: controller.delete.bind(controller),
  });
}
