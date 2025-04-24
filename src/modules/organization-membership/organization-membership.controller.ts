import { FastifyRequest, FastifyReply } from 'fastify';
import {
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization-membership.interface';
import { OrganizationMembershipService } from './organization-membership.service';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../utils/response-handler';

export class OrganizationMembershipController {
  private service: OrganizationMembershipService;

  constructor() {
    this.service = new OrganizationMembershipService();
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get organization ID from request user (set by middleware)
      const orgId = request.user?.orgId;
      if (!orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const data = request.body as ICreateOrganizationMembership;
      const membership = await this.service.create(data, orgId);

      return sendSuccessResponse(reply, 201, membership);
    } catch (error) {
      return sendErrorResponse(
        reply,
        400,
        error,
        error instanceof Error
          ? error.message
          : 'Failed to create organization membership',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get organization ID from request user (set by middleware)
      const orgId = request.user?.orgId;
      if (!orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const memberships = await this.service.findAll(orgId);
      return sendSuccessResponse(reply, 200, memberships);
    } catch (error) {
      return sendErrorResponse(
        reply,
        400,
        error,
        error instanceof Error
          ? error.message
          : 'Failed to retrieve organization memberships',
      );
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const membership = await this.service.findById(id);

      if (!membership) {
        return sendErrorResponse(reply, 404, null, 'Membership not found');
      }

      return sendSuccessResponse(reply, 200, membership);
    } catch (error) {
      return sendErrorResponse(
        reply,
        400,
        error,
        error instanceof Error
          ? error.message
          : 'Failed to retrieve organization membership',
      );
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    console.log(request.body);
    try {
      const { id } = request.params as { id: string };
      const data = request.body as Omit<IUpdateOrganizationMembership, 'id'>;

      // Combine ID from URL with data from body
      const updateData: IUpdateOrganizationMembership = {
        id,
        ...data,
      };

      const membership = await this.service.update(updateData);
      console.log(membership);
      return sendSuccessResponse(reply, 200, membership);
    } catch (error) {
      return sendErrorResponse(
        reply,
        400,
        error,
        error instanceof Error
          ? error.message
          : 'Failed to update organization membership',
      );
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const membership = await this.service.delete(id);
      return sendSuccessResponse(reply, 200, membership);
    } catch (error) {
      return sendErrorResponse(
        reply,
        400,
        error,
        error instanceof Error
          ? error.message
          : 'Failed to delete organization membership',
      );
    }
  }
}
