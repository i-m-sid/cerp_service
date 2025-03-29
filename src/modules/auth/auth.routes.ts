import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { RegisterInputSchema, LoginInputSchema } from './auth.types';
import { z } from 'zod';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

const authService = new AuthService();

export async function authRoutes(fastify: FastifyInstance) {
  // CORS options for /auth/register
  fastify.options('/auth/register', async (request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'POST')
      .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .send();
  });

  // Register endpoint
  fastify.post('/auth/register', async (request, reply) => {
    try {
      const registerData = RegisterInputSchema.parse(request.body);
      const authResponse = await authService.register(registerData);

      reply.header('Access-Control-Allow-Origin', '*');
      return sendSuccessResponse(reply, 201, authResponse);
    } catch (error) {
      reply.header('Access-Control-Allow-Origin', '*');

      if (error instanceof z.ZodError) {
        return sendErrorResponse(reply, 400, error.errors, 'Validation failed');
      }

      const statusCode =
        error instanceof Error && error.message.includes('already exists')
          ? 409
          : 400;
      return sendErrorResponse(
        reply,
        statusCode,
        error,
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  });

  // CORS options for /auth/login
  fastify.options('/auth/login', async (request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'POST')
      .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .send();
  });

  // Login endpoint
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const loginData = LoginInputSchema.parse(request.body);
      const authResponse = await authService.login(loginData);

      reply.header('Access-Control-Allow-Origin', '*');
      return sendSuccessResponse(reply, 200, authResponse);
    } catch (error) {
      reply.header('Access-Control-Allow-Origin', '*');

      if (error instanceof z.ZodError) {
        return sendErrorResponse(reply, 400, error.errors, 'Validation failed');
      }

      return sendErrorResponse(
        reply,
        401,
        error,
        error instanceof Error ? error.message : 'Invalid credentials',
      );
    }
  });

  // CORS options for /auth/me
  fastify.options('/auth/me', async (request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'GET')
      .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .send();
  });

  // Get current user
  fastify.get(
    '/auth/me',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      return sendSuccessResponse(reply, 200, { user: request.user });
    },
  );
}
