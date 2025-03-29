import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service';
import { sendErrorResponse } from '../utils/response-handler';

const authService = new AuthService();

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return sendErrorResponse(
        reply,
        401,
        'No authorization header',
        'Authentication required',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyJWT(token);

    // Attach user info to request
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return sendErrorResponse(
      reply,
      401,
      error,
      error instanceof Error ? error.message : 'Authentication failed',
    );
  }
}
