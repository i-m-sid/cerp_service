import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '../utils/response-handler';

/**
 * Middleware to validate organization ID is present in the request
 * This should be applied after auth middleware to ensure user is authenticated
 */
export async function validateOrgId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const orgId = request.user?.orgId;

    if (!orgId) {
      return sendErrorResponse(
        reply,
        401,
        null,
        'Organization ID not found. Authentication required.',
      );
    }
  } catch (error) {
    return sendErrorResponse(
      reply,
      500,
      error,
      error instanceof Error ? error.message : 'Organization validation failed',
    );
  }
}
