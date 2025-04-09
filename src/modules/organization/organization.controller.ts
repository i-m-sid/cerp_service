import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationService } from './organization.service';
import {
  ICreateOrganization,
  IUpdateOrganization,
  ICreateOrganizationMembership,
  IUpdateOrganizationMembership,
} from './organization.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class OrganizationController {
  private service: OrganizationService;

  constructor() {
    this.service = new OrganizationService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreateOrganization, 'createdBy'> }>,
    reply: FastifyReply,
  ) {
    try {
      const org = await this.service.create({
        ...request.body,
        createdBy: request.user!.userId,
      });
      return sendSuccessResponse(reply, 201, org);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create organization',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const orgs = await this.service.findAll();
      return sendSuccessResponse(reply, 200, orgs);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch organizations',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const org = await this.service.findById(request.params.orgId);
      if (!org) {
        return sendErrorResponse(reply, 404, null, 'Organization not found');
      }
      return sendSuccessResponse(reply, 200, org);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch organization',
      );
    }
  }

  async findByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const orgs = await this.service.findByUserId(request.params.userId);
      return sendSuccessResponse(reply, 200, orgs);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch organizations by user',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { orgId: string };
      Body: Omit<IUpdateOrganization, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const org = await this.service.update({
        id: request.params.orgId,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, org);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update organization',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      await this.service.delete(request.params.orgId);
      return sendSuccessResponse(reply, 200, {
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete organization',
      );
    }
  }

  // Organization Membership methods
  async addMember(
    request: FastifyRequest<{
      Params: { orgId: string };
      Body: Omit<ICreateOrganizationMembership, 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const membership = await this.service.addMember({
        ...request.body,
        orgId: request.params.orgId,
      });
      return sendSuccessResponse(reply, 201, membership);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to add organization member',
      );
    }
  }

  async findMembershipById(
    request: FastifyRequest<{
      Params: { orgId: string; memberId: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const membership = await this.service.findMembershipById(
        request.params.memberId,
      );
      if (!membership) {
        return sendErrorResponse(reply, 404, null, 'Membership not found');
      }
      return sendSuccessResponse(reply, 200, membership);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch organization membership',
      );
    }
  }

  async findMembershipsByOrgId(
    request: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const memberships = await this.service.findMembershipsByOrgId(
        request.params.orgId,
      );
      return sendSuccessResponse(reply, 200, memberships);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch organization memberships',
      );
    }
  }

  async findMembershipsByUserId(
    request: FastifyRequest<{
      Params: { orgId: string; userId: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const memberships = await this.service.findMembershipsByUserId(
        request.params.userId,
      );
      return sendSuccessResponse(reply, 200, memberships);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch user memberships',
      );
    }
  }

  async updateMembership(
    request: FastifyRequest<{
      Params: { orgId: string; memberId: string };
      Body: Omit<IUpdateOrganizationMembership, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const membership = await this.service.updateMembership({
        id: request.params.memberId,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, membership);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update organization membership',
      );
    }
  }

  async removeMember(
    request: FastifyRequest<{
      Params: { orgId: string; memberId: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      await this.service.removeMember(request.params.memberId);
      return sendSuccessResponse(reply, 200, {
        message: 'Organization member removed successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to remove organization member',
      );
    }
  }

  async getUserRole(
    request: FastifyRequest<{
      Params: { orgId: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const role = await this.service.getUserRole(
        request.user!.userId,
        request.params.orgId,
      );
      return sendSuccessResponse(reply, 200, { role });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        error instanceof Error &&
          error.message === 'User is not a member of this organization'
          ? 404
          : 500,
        error,
        'Failed to get user role',
      );
    }
  }

  async checkUserRole(
    request: FastifyRequest<{
      Params: { orgId: string };
      Querystring: { roles: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const roles = request.query.roles.split(',');
      const hasRole = await this.service.hasRole(
        request.user!.userId,
        request.params.orgId,
        roles,
      );
      return sendSuccessResponse(reply, 200, { hasRole });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to check user role');
    }
  }
}
