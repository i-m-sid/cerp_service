import { FastifyReply, FastifyRequest } from 'fastify';
import { ChallanRecordService } from './challan-record.service';

export class ChallanRecordController {
  private service: ChallanRecordService;

  constructor() {
    this.service = new ChallanRecordService();
  }

  /**
   * Get challans filtered by record template
   * @param request - Fastify request object containing record template ID
   * @param reply - Fastify reply object
   */
  async getChallansByRecordTemplate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { id: recordTemplateId } = request.params;
    console.log('Getting challans for record template:', recordTemplateId);

    try {
      const result =
        await this.service.getChallansByRecordTemplate(recordTemplateId);
      console.log('Found record template with challans:', result);
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
