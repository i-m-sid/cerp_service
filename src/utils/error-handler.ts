import { FastifyInstance } from 'fastify';

export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, req, reply) => {
    reply.status(500).send({
      status: 'error',
      message: 'Internal server error',
      error: error,
    });
  });
}
