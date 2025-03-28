import { FastifyReply } from 'fastify';

export function sendSuccessResponse<T>(
  reply: FastifyReply,
  statusCode = 200,
  data: T,
) {
  reply.status(statusCode).send(data);
}

export function sendErrorResponse(
  reply: FastifyReply,
  statusCode = 500,
  error: any,
  message?: string,
) {
  reply.status(statusCode).send({
    statusCode: statusCode,
    messageForUser: message,
    error: error,
  });
}
