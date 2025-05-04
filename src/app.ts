import Fastify from 'fastify';
import dotenv from 'dotenv';
import { setupErrorHandler } from './utils/error-handler';
import fastifyFormbody from '@fastify/formbody';
import fastifyCors from '@fastify/cors';
import { registerRoutes } from './routes';
import { orgValidationPlugin } from './plugins/org-validation.plugin';

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

// Register the organization validation plugin
app.register(orgValidationPlugin);

// Register all routes
app.register(registerRoutes);

// Setup global error handler
setupErrorHandler(app);

export default app;
