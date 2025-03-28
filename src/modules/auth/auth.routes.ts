import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.middleware';

const authService = new AuthService();

const googleAuthSchema = z.object({
  idToken: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/google', async (request, reply) => {
    try {
      const { idToken } = googleAuthSchema.parse(request.body);

      // Verify Google token
      const googleUser = await authService.verifyGoogleToken(idToken);

      console.log('googleUser', googleUser);

      // Authenticate user and generate JWT
      const authResponse = await authService.authenticateUser(googleUser);

      return reply.send(authResponse);
    } catch (error) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid token',
      });
    }
  });

  // Example protected route
  fastify.get('/auth/me', { preHandler: [authMiddleware] }, async (request) => {
    return { user: request.user };
  });
}
