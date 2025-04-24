import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanService } from './challan.service';
import {
  ICreateChallan,
  IUpdateChallan,
  IBulkUpdateChallans,
  IBulkDeleteChallans,
} from './challan.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { UserRole } from '@prisma/client';

export class ChallanController {
  private service: ChallanService;

  constructor() {
    this.service = new ChallanService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateChallan }>,
    reply: FastifyReply,
  ) {
    try {
      const challan = await this.service.create(request.body, request.user!.orgId!);
      return sendSuccessResponse(reply, 201, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create challan');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const challan = await this.service.findById(request.params.id, request.user!.orgId!);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch challan');
    }
  }

  async getChallansByTemplateId(
    request: FastifyRequest<{
      Params: { templateId: string };
      Querystring: {
        startDate?: string;
        endDate?: string;
        partyId?: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { templateId } = request.params;
    const { startDate, endDate, partyId } = request.query;

    try {
      const result = await this.service.getChallansByTemplateId(
        templateId,
        request.user!.orgId!,
        request.user!.role as UserRole,
        {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          partyId,
        },
      );
      reply.send(result);
    } catch (error) {
      console.error('Error in getChallansByRecordTemplate:', error);
      if (
        error instanceof Error &&
        error.message === 'Record template not found'
      ) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateChallan, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const updateData: IUpdateChallan = {
        ...request.body,
        id: request.params.id,
      };
      const challan = await this.service.update(updateData, request.user!.orgId!);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, challan);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update challan');
    }
  }

  async bulkUpdate(
    request: FastifyRequest<{ Body: IBulkUpdateChallans }>,
    reply: FastifyReply,
  ) {
    try {
      const results = await this.service.bulkUpdate(request.body, request.user!.orgId!);
      console.log(results);
      return sendSuccessResponse(reply, 200, results);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to bulk update challans',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const challan = await this.service.delete(request.params.id, request.user!.orgId!);
      if (!challan) {
        return sendErrorResponse(reply, 404, null, 'Challan not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Challan deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete challan');
    }
  }

  async bulkDelete(
    request: FastifyRequest<{ Body: IBulkDeleteChallans }>,
    reply: FastifyReply,
  ) {
    try {
      const results = await this.service.bulkDelete(request.body.ids, request.user!.orgId!);

      // Check if any challans failed to delete
      const failedDeletions = results.filter((result) => !result.success);
      const failedIds = failedDeletions.map((result) => result.id);

      if (failedDeletions.length > 0) {
        return sendSuccessResponse(reply, 207, {
          message: 'Some challans were not deleted successfully',
          results,
          failedIds,
        });
      }

      return sendSuccessResponse(reply, 200, {
        message: 'All challans deleted successfully',
        results,
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete challans');
    }
  }
}
