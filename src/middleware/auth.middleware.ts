import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service';

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
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyJWT(token);

    // Attach user info to request
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
} 