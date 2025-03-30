import Fastify from 'fastify';
import dotenv from 'dotenv';
import { setupErrorHandler } from './utils/error-handler';
import fastifyFormbody from '@fastify/formbody';
import fastifyRedis from '@fastify/redis';
import fastifyCors from '@fastify/cors';
import { registerRoutes } from './routes';

dotenv.config();

// Create Fastify instance
const app = Fastify({ logger: true });

// Register CORS - must be first plugin to ensure proper preflight handling
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflight: true,
  strictPreflight: false,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

app.register(fastifyFormbody);

// Register all routes
app.register(registerRoutes);

// Setup global error handler
setupErrorHandler(app);

export default app;
