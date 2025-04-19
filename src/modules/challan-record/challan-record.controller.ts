import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanRecordService } from './challan-record.service';
import { UserRole } from '@prisma/client';
export class ChallanRecordController {
  private service: ChallanRecordService;

  constructor() {
    this.service = new ChallanRecordService();
  }

  /**
   * Get challans filtered by record template
   * @param request - Fastify request object containing record template ID and optional filters
   * @param reply - Fastify reply object
   */
  async getChallansByRecordTemplate(
    request: FastifyRequest<{
      Params: { id: string };
      Querystring: {
        startDate?: string;
        endDate?: string;
        partyId?: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { id: recordTemplateId } = request.params;
    const { startDate, endDate, partyId } = request.query;

    try {
      const result = await this.service.getChallansByRecordTemplate(
        recordTemplateId,
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
}
