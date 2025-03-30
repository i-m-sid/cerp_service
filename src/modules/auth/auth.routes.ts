import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AuthController } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  // Register routes
  fastify.route({
    method: 'POST',
    url: '/register',
    handler: controller.register.bind(controller),
  });

  // Login routes
  fastify.route({
    method: 'POST',
    url: '/login',
    handler: controller.login.bind(controller),
  });

  // Current user routes
  fastify.route({
    method: 'GET',
    url: '/me',
    preHandler: [authMiddleware],
    handler: controller.getCurrentUser.bind(controller),
  });
}
