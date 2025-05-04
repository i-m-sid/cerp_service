import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { validateOrgId } from '../middleware/org-validation.middleware';

/**
 * Plugin to automatically apply organization ID validation middleware to all routes
 * except auth and organization-related routes
 */
const orgValidationPluginFn: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  // Apply the org validation middleware to all routes except those we want to exclude
  fastify.addHook('onRoute', (routeOptions) => {
    const path = routeOptions.url;

    // Skip middleware for auth and organization routes
    const excludedPaths = [
      '/api/auth',
      '/api/organization',
      '/api/reference',
      '/api/state-code',
    ];

    // Check if the route path starts with any of the excluded paths
    const shouldExclude = excludedPaths.some((excludedPath) =>
      path.startsWith(excludedPath),
    );

    if (!shouldExclude) {
      // Get existing preHandler hooks or create an empty array
      const existingHandlers = routeOptions.preHandler || [];
      const handlers = Array.isArray(existingHandlers)
        ? existingHandlers
        : [existingHandlers];

      // Add our validation middleware
      routeOptions.preHandler = [...handlers, validateOrgId];
    }
  });
};

export const orgValidationPlugin = fp(orgValidationPluginFn, {
  name: 'org-validation-plugin',
});
