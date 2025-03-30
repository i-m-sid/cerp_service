import { FastifyInstance } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes';
import { challanTemplateRoutes } from './modules/challan-template/challan-template.routes';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';
import { uomRoutes } from './modules/uom/uom.routes';
import { itemCategoryRoutes } from './modules/item-category/item-category.routes';
import { itemRoutes } from './modules/item/item.routes';
import { customerTypeRoutes } from './modules/customer-type/customer-type.routes';
import { customerRoutes } from './modules/customer/customer.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // Auth routes
  fastify.register(authRoutes, { prefix: '/api/auth' });

  // Challan Template routes
  fastify.register(challanTemplateRoutes, { prefix: '/api/challan-templates' });

  // Vehicle routes
  fastify.register(vehicleRoutes, { prefix: '/api/vehicles' });

  // UOM routes
  fastify.register(uomRoutes, { prefix: '/api/uom' });

  // Item Category routes
  fastify.register(itemCategoryRoutes, { prefix: '/api/item-categories' });

  // Item routes
  fastify.register(itemRoutes, { prefix: '/api/items' });

  // Customer Type routes
  fastify.register(customerTypeRoutes, { prefix: '/api/customer-types' });

  // Customer routes
  fastify.register(customerRoutes, { prefix: '/api/customers' });
}
