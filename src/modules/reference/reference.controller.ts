import { FastifyReply, FastifyRequest } from 'fastify';
import { ReferenceService } from './reference.service';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class ReferenceController {
  private service: ReferenceService;

  constructor() {
    this.service = new ReferenceService();
  }

  async getTableReferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tables = await this.service.getTableReferences();
      return sendSuccessResponse(reply, 200, { references: tables });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch table references',
      );
    }
  }
}
