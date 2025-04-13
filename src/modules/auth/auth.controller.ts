import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterInputSchema, LoginInputSchema } from './auth.types';
import { z } from 'zod';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const registerData = RegisterInputSchema.parse(request.body);
      const authResponse = await this.authService.register(registerData);
      return sendSuccessResponse(reply, 201, authResponse);
    } catch (error) {
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
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('request.body', request.body);
      const loginData = LoginInputSchema.parse(request.body);
      const authResponse = await this.authService.login(loginData);
      console.log('authResponse', authResponse);
      return sendSuccessResponse(reply, 200, authResponse);
    } catch (error) {
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
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    return sendSuccessResponse(reply, 200, { user: request.user });
  }

  async handleCorsOptions(request: FastifyRequest, reply: FastifyReply) {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'POST, GET')
      .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .send();
  }
}
