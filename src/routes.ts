import { FastifyInstance } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes';
import { challanTemplateRoutes } from './modules/challan-template/challan-template.routes';
import { challanRoutes } from './modules/challan/challan.routes';
import { challanStatusRoutes } from './modules/challan-status/challan-status.routes';
import { challanRecordTemplateRoutes } from './modules/challan-record-template/challan-record-template.routes';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';
import { uomRoutes } from './modules/uom/uom.routes';
import { itemCategoryRoutes } from './modules/item-category/item-category.routes';
import { itemRoutes } from './modules/item/item.routes';
import { customerTypeRoutes } from './modules/customer-type/customer-type.routes';
import { customerRoutes } from './modules/customer/customer.routes';
import { referenceRoutes } from './modules/reference/reference.routes';
import { challanRecordRoutes } from './modules/challan-record/challan-record.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // Auth routes
  fastify.register(authRoutes, { prefix: '/api/auth' });

  // Challan Template routes
  fastify.register(challanTemplateRoutes, { prefix: '/api/challan-template' });

  // Challan routes
  fastify.register(challanRoutes, { prefix: '/api/challan' });

  // Challan Status routes
  fastify.register(challanStatusRoutes, { prefix: '/api/challan-status' });

  // Challan Record Template routes
  fastify.register(challanRecordTemplateRoutes, {
    prefix: '/api/challan-record-template',
  });

  // Vehicle routes
  fastify.register(vehicleRoutes, { prefix: '/api/vehicle' });

  // UOM routes
  fastify.register(uomRoutes, { prefix: '/api/uom' });

  // Item Category routes
  fastify.register(itemCategoryRoutes, { prefix: '/api/item-category' });

  // Item routes
  fastify.register(itemRoutes, { prefix: '/api/item' });

  // Customer Type routes
  fastify.register(customerTypeRoutes, { prefix: '/api/customer-type' });

  // Customer routes
  fastify.register(customerRoutes, { prefix: '/api/customer' });

  // Reference routes
  fastify.register(referenceRoutes, { prefix: '/api/reference' });

  // Challan Record routes
  fastify.register(challanRecordRoutes, { prefix: '/api/challan-record' });
}
