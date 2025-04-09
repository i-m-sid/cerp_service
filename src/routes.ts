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
import { partyTypeRoutes } from './modules/party-type/party-type.routes';
import { partyRoutes } from './modules/party/party.routes';
import { referenceRoutes } from './modules/reference/reference.routes';
import { challanRecordRoutes } from './modules/challan-record/challan-record.routes';
import { invoiceRoutes } from './modules/invoice/invoice.routes';
import { organizationRoutes } from './modules/organization/organization.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // Organization routes
  fastify.register(organizationRoutes, { prefix: '/api/organization' });

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

  // Party Type routes
  fastify.register(partyTypeRoutes, { prefix: '/api/party-type' });

  // Party routes
  fastify.register(partyRoutes, { prefix: '/api/party' });

  // Reference routes
  fastify.register(referenceRoutes, { prefix: '/api/reference' });

  // Challan Record routes
  fastify.register(challanRecordRoutes, { prefix: '/api/challan-record' });

  // Invoice routes
  fastify.register(invoiceRoutes, { prefix: '/api/invoice' });
}
