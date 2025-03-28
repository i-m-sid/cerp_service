import fastify from 'fastify';
import { authRoutes } from './modules/auth/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';
import dotenv from 'dotenv';

dotenv.config();

const server = fastify({
  logger: true,
});

// Register auth middleware as a decorator
server.decorate('auth', authMiddleware);

// Register routes
server.register(authRoutes);

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
