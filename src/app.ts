import Fastify from 'fastify';
import dotenv from 'dotenv';
import { setupErrorHandler } from './utils/error-handler';
import fastifyFormbody from '@fastify/formbody';
import fastifyRedis from '@fastify/redis';
import { authRoutes } from './modules/auth/auth.routes';

dotenv.config();

// Create Fastify instance
const app = Fastify({ logger: true });

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
