import { FastifyReply, FastifyRequest } from 'fastify';
import { JournalService } from './journal.service';
import { ICreateJournal, IUpdateJournal } from './journal.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { JournalStatus, VoucherType } from '@prisma/client';
import { SourceType } from '@prisma/client';

export class JournalController {
  private service: JournalService;

  constructor() {
    this.service = new JournalService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreateJournal, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const journal = await this.service.create({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, journal);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create journal');
    }
  }

  async findAll(request: FastifyRequest<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      source?: SourceType;
      voucherType?: VoucherType;
      status?: JournalStatus;
    };
  }>, reply: FastifyReply) {
    try {
      const { startDate, endDate, source, voucherType, status } = request.query;
      const journals = await this.service.findAll(request.user!.orgId!, {
        startDate,
        endDate,
        source,
        voucherType,
        status,
      });
      return sendSuccessResponse(reply, 200, journals);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch journals');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const journal = await this.service.findById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!journal) {
        return sendErrorResponse(reply, 404, null, 'Journal not found');
      }
      return sendSuccessResponse(reply, 200, journal);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch journal');
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateJournal, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const journal = await this.service.update({
        id: request.params.id,
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 200, journal);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update journal');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const journal = await this.service.delete(request.params.id);
      if (!journal) {
        return sendErrorResponse(reply, 404, null, 'Journal not found');
      }
      return sendSuccessResponse(reply, 204, {
        message: 'Journal deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete journal');
    }
  }
}
