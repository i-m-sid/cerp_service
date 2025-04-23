import { FastifyInstance } from 'fastify';
import { StateCodeController } from './state-code.controller';

export async function stateCodeRoutes(fastify: FastifyInstance) {
  const controller = new StateCodeController();

  // Get all state codes
  fastify.get('', controller.getAllStates.bind(controller));

  // Get state by code
  fastify.get('/code/:code', controller.getStateByCode.bind(controller));

  // Get state by alpha code
  fastify.get(
    '/alpha/:alphaCode',
    controller.getStateByAlphaCode.bind(controller),
  );

  // Get state by name
  fastify.get('/name/:name', controller.getStateByName.bind(controller));
}
