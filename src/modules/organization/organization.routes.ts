import { FastifyInstance } from 'fastify';
import { OrganizationController } from './organization.controller';
import { requireRole } from '../../middleware/auth.middleware';

const controller = new OrganizationController();

export async function organizationRoutes(fastify: FastifyInstance) {
  // Organization routes
  fastify.post('/', {
    handler: controller.create.bind(controller),
  });

  fastify.get('/', {
    handler: controller.findAll.bind(controller),
  });

  fastify.get('/:orgId', {
    handler: controller.findById.bind(controller),
  });

  fastify.get('/user/:userId', {
    handler: controller.findByUserId.bind(controller),
  });

  fastify.put('/:orgId', {
    preHandler: [requireRole(['OWNER', 'ADMIN'])],
    handler: controller.update.bind(controller),
  });

  fastify.delete('/:orgId', {
    preHandler: [requireRole(['OWNER'])],
    handler: controller.delete.bind(controller),
  });

  // Organization Membership routes
  fastify.post('/:orgId/members', {
    preHandler: [requireRole(['OWNER', 'ADMIN'])],
    handler: controller.addMember.bind(controller),
  });

  fastify.get('/:orgId/members/:memberId', {
    preHandler: [requireRole(['OWNER', 'ADMIN', 'MANAGER'])],
    handler: controller.findMembershipById.bind(controller),
  });

  fastify.get('/:orgId/members', {
    preHandler: [requireRole(['OWNER', 'ADMIN', 'MANAGER'])],
    handler: controller.findMembershipsByOrgId.bind(controller),
  });

  fastify.get('/:orgId/members/user/:userId', {
    preHandler: [requireRole(['OWNER', 'ADMIN', 'MANAGER'])],
    handler: controller.findMembershipsByUserId.bind(controller),
  });

  fastify.put('/:orgId/members/:memberId', {
    preHandler: [requireRole(['OWNER', 'ADMIN'])],
    handler: controller.updateMembership.bind(controller),
  });

  fastify.delete('/:orgId/members/:memberId', {
    preHandler: [requireRole(['OWNER'])],
    handler: controller.removeMember.bind(controller),
  });

  // User Role routes
  fastify.get('/:orgId/role', {
    handler: controller.getUserRole.bind(controller),
  });

  fastify.get('/:orgId/check-role', {
    handler: controller.checkUserRole.bind(controller),
  });
}
