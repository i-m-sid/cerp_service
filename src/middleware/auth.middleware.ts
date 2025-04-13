import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service';
import { sendErrorResponse } from '../utils/response-handler';
import { OrganizationMembershipService } from '../modules/organization-membership/organization-membership.service';

const authService = new AuthService();
const organizationMembershipService = new OrganizationMembershipService();

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role?: string;
      orgId?: string;
    };
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return sendErrorResponse(
        reply,
        401,
        'No authorization header',
        'Authentication required',
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyJWT(token);

    // Get organization ID from URL if present
    const orgId = (request.query as { orgId?: string })?.orgId;

    // Attach user info to request
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // If organization ID is present in URL, get and attach user's role and orgId
    if (orgId) {
      try {
        const role = await organizationMembershipService.getUserRole(
          orgId,
          decoded.userId,
        );
        request.user.role = role;
        request.user.orgId = orgId;
      } catch (error) {
        // If user is not a member, don't attach role or orgId
        // This allows public endpoints to work while protected ones can check for role
        if (
          !(
            error instanceof Error &&
            error.message === 'User is not a member of this organization'
          )
        ) {
          throw error;
        }
      }
    }
  } catch (error) {
    return sendErrorResponse(
      reply,
      401,
      error,
      error instanceof Error ? error.message : 'Authentication failed',
    );
  }
}

// Middleware to check if user has required role
export function requireRole(allowedRoles: string[]) {
  return async function roleMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const userRole = request.user?.role;
    const orgId = request.user?.orgId;

    if (!orgId) {
      return sendErrorResponse(reply, 403, null, 'Organization ID is required');
    }

    if (!userRole) {
      return sendErrorResponse(
        reply,
        403,
        null,
        'You do not have access to this organization',
      );
    }

    if (!allowedRoles.includes(userRole)) {
      return sendErrorResponse(
        reply,
        403,
        null,
        'You do not have the required role to perform this action',
      );
    }
  };
}
