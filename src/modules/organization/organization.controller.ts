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
      if (!request.user?.userId) {
        return sendErrorResponse(reply, 401, null, 'User not authenticated');
      }

      const organizations = await this.service.findAll(request.user.userId);
      console.log('organizations', organizations);
      return sendSuccessResponse(reply, 200, organizations);
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

  async update(
    request: FastifyRequest<{
      Params: { orgId: string };
      Body: Omit<IUpdateOrganization, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      console.log('request.body', JSON.stringify(request.body, null, 2));
      const org = await this.service.update(
        {
          id: request.params.orgId,
          ...request.body,
        },
        request.user!.userId,
      );
      console.log('org', JSON.stringify(org, null, 2));
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
}
