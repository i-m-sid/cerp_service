import { FastifyInstance } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes';
import { challanTemplateRoutes } from './modules/challan-template/challan-template.routes';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // Auth routes
  fastify.register(authRoutes, { prefix: '/api/auth' });

  // Challan Template routes
  fastify.register(challanTemplateRoutes, { prefix: '/api/challan-templates' });

  // Vehicle routes
  fastify.register(vehicleRoutes, { prefix: '/api/vehicles' });
}
