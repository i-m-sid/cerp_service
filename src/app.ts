import Fastify from 'fastify';
import dotenv from 'dotenv';
import { setupErrorHandler } from './utils/error-handler';
import fastifyFormbody from '@fastify/formbody';
import fastifyRedis from '@fastify/redis';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './modules/auth/auth.routes';

dotenv.config();

// Create Fastify instance
const app = Fastify({ logger: true });

// Register CORS
app.register(fastifyCors, {
  // Allow all origins in development
  // In production, you should configure this to match your deployment URLs
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

app.register(fastifyFormbody);

// Connect to Upstash Redis
app.register(fastifyRedis, {
  url: process.env.REDIS_URL as string,
  tls: {}, // Upstash requires TLS
  password: process.env.REDIS_TOKEN as string,
});

// Register Routes
app.register(authRoutes);

// Setup global error handler
setupErrorHandler(app);

export default app;
