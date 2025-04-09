import { FastifyReply, FastifyRequest } from 'fastify';
import { PartyService } from './party.service';
import { ICreateParty, IUpdateParty } from './party.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class PartyController {
  private service: PartyService;

  constructor() {
    this.service = new PartyService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateParty }>,
    reply: FastifyReply,
  ) {
    try {
      const party = await this.service.create(
        request.body,
        request.user?.orgId!,
      );
      return sendSuccessResponse(reply, 201, party);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create party');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parties = await this.service.findAll(request.user?.orgId!);
      return sendSuccessResponse(reply, 200, parties);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch parties');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const party = await this.service.findById(
        request.params.id,
        request.user?.orgId!,
      );
      if (!party) {
        return sendErrorResponse(reply, 404, null, 'Party not found');
      }
      return sendSuccessResponse(reply, 200, party);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch party');
    }
  }

  async findByPartyType(
    request: FastifyRequest<{ Params: { partyTypeId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const parties = await this.service.findByPartyType(
        request.params.partyTypeId,
        request.user?.orgId!,
      );
      return sendSuccessResponse(reply, 200, parties);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch parties by type',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateParty, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    console.log(request.body);
    try {
      const party = await this.service.update({
        id: request.params.id,
        ...request.body,
        orgId: request.user?.orgId!,
      });
      return sendSuccessResponse(reply, 200, party);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update party');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const party = await this.service.delete(request.params.id);
      if (!party) {
        return sendErrorResponse(reply, 404, null, 'Party not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Party deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete party');
    }
  }
}
