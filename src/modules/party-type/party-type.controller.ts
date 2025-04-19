import { FastifyReply, FastifyRequest } from 'fastify';
import { PartyTypeService } from './party-type.service';
import { ICreatePartyType, IUpdatePartyType } from './party-type.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class PartyTypeController {
  private service: PartyTypeService;

  constructor() {
    this.service = new PartyTypeService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreatePartyType, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const partyType = await this.service.create({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, partyType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create party type',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const partyTypes = await this.service.findAll();
      return sendSuccessResponse(reply, 200, partyTypes);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch party types',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const partyType = await this.service.findById(request.params.id);
      if (!partyType) {
        return sendErrorResponse(reply, 404, null, 'Party type not found');
      }
      return sendSuccessResponse(reply, 200, partyType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch party type');
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdatePartyType, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const partyType = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, partyType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update party type',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const partyType = await this.service.delete(request.params.id);
      if (!partyType) {
        return sendErrorResponse(reply, 404, null, 'Party type not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Party type deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete party type',
      );
    }
  }
}
