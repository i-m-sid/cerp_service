import { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceService } from './invoice.service';
import {
  ICreateInvoice,
  IUpdateInvoice,
  IBulkUpdateInvoices,
  IBulkDeleteInvoices,
} from './invoice.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { InvoiceType, TransactionType } from '@prisma/client';

export class InvoiceController {
  private service: InvoiceService;

  constructor() {
    this.service = new InvoiceService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateInvoice }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const invoice = await this.service.create({
        ...request.body,
        orgId: request.user.orgId,
      });
      return sendSuccessResponse(reply, 201, invoice);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create invoice');
    }
  }

  async findAll(
    request: FastifyRequest<{
      Querystring: {
        transactionType?: string;
        startDate?: string;
        endDate?: string;
        partyId?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const { transactionType, startDate, endDate, partyId } = request.query;
      const invoices = await this.service.findAll(
        request.user.orgId,
        transactionType as TransactionType | undefined,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        partyId,
      );
      return sendSuccessResponse(reply, 200, invoices);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch invoices');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const invoice = await this.service.findById(
        request.params.id,
        request.user.orgId,
      );
      if (!invoice) {
        return sendErrorResponse(reply, 404, null, 'Invoice not found');
      }
      return sendSuccessResponse(reply, 200, invoice);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch invoice');
    }
  }

  async findByCustomerId(
    request: FastifyRequest<{ Params: { customerId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const invoices = await this.service.findByPartyId(
        request.params.customerId,
        request.user.orgId,
      );
      return sendSuccessResponse(reply, 200, invoices);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch customer invoices',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateInvoice, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const invoice = await this.service.update({
        ...request.body,
        id: request.params.id,
        orgId: request.user.orgId,
      });
      return sendSuccessResponse(reply, 200, invoice);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update invoice');
    }
  }

  async bulkUpdate(
    request: FastifyRequest<{ Body: IBulkUpdateInvoices }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const { invoices } = request.body;
      const updatedInvoices = await this.service.bulkUpdate({
        invoices: invoices.map((invoice) => ({
          ...invoice,
          orgId: request.user?.orgId!,
        })),
      });
      return sendSuccessResponse(reply, 200, updatedInvoices);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to bulk update invoices',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const invoice = await this.service.delete(
        request.params.id,
        request.user.orgId,
      );
      if (!invoice) {
        return sendErrorResponse(reply, 404, null, 'Invoice not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete invoice');
    }
  }

  async findByTypes(
    request: FastifyRequest<{
      Querystring: {
        transactionType?: string;
        invoiceType?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const { transactionType, invoiceType } = request.query;
      const invoices = await this.service.findByTypes(
        request.user.orgId,
        transactionType as TransactionType | undefined,
        invoiceType as InvoiceType | undefined,
      );
      return sendSuccessResponse(reply, 200, invoices);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch invoices by types',
      );
    }
  }

  async bulkDelete(
    request: FastifyRequest<{ Body: IBulkDeleteInvoices }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user?.orgId) {
        return sendErrorResponse(
          reply,
          400,
          null,
          'Organization ID is required',
        );
      }

      const results = await this.service.bulkDelete(
        request.body.ids,
        request.user.orgId,
      );

      // Check if any invoices failed to delete
      const failedDeletions = results.filter((result) => !result.success);
      const failedIds = failedDeletions.map((result) => result.id);

      if (failedDeletions.length > 0) {
        return sendSuccessResponse(reply, 207, {
          message: 'Some invoices were not deleted successfully',
          results,
          failedIds,
        });
      }

      return sendSuccessResponse(reply, 200, {
        message: 'All invoices deleted successfully',
        results,
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete invoices');
    }
  }
}
