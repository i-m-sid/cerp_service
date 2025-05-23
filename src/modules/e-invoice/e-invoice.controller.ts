import { FastifyRequest, FastifyReply } from 'fastify';
import { EInvoiceService } from './e-invoice.service';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { ICreateEInvoice } from './e-invoice.interface';
export class EInvoiceController {
  private service: EInvoiceService;

  constructor() {
    this.service = new EInvoiceService();
  }

  async generateEInvoiceV2(
    req: FastifyRequest<{ Body: ICreateEInvoice }>,
    res: FastifyReply,
  ) {
    try {
      const invoices = await this.service.generateEInvoiceV2(
        req.body.invoiceIds,
        req.user?.orgId!,
      );
      return sendSuccessResponse(res, 200, invoices);
    } catch (error) {
      return sendErrorResponse(res, 500, error);
    }
  }
}
