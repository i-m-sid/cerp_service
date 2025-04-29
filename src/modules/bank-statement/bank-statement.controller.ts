import { FastifyReply, FastifyRequest } from 'fastify';
import { BankStatementService } from './bank-statement.service';
import {
  ICreateBankStatement,
  IUpdateBankStatement,
  IReconcileBankStatementEntry,
} from './bank-statement.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class BankStatementController {
  private service: BankStatementService;

  constructor() {
    this.service = new BankStatementService();
  }

  async create(
    request: FastifyRequest<{ Body: Omit<ICreateBankStatement, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const bankStatement = await this.service.create({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, bankStatement);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create bank statement',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const bankStatements = await this.service.findAll(request.user!.orgId!);
      return sendSuccessResponse(reply, 200, bankStatements);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch bank statements',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const bankStatement = await this.service.findById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!bankStatement) {
        return sendErrorResponse(reply, 404, null, 'Bank statement not found');
      }
      return sendSuccessResponse(reply, 200, bankStatement);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch bank statement',
      );
    }
  }

  async findByAccountId(
    request: FastifyRequest<{ Params: { accountId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const bankStatements = await this.service.findByAccountId(
        request.params.accountId,
        request.user!.orgId!,
      );
      return sendSuccessResponse(reply, 200, bankStatements);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch bank statements for account',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateBankStatement, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const bankStatement = await this.service.update({
        id: request.params.id,
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 200, bankStatement);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update bank statement',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const bankStatement = await this.service.delete(request.params.id);
      if (!bankStatement) {
        return sendErrorResponse(reply, 404, null, 'Bank statement not found');
      }
      return sendSuccessResponse(reply, 204, {
        message: 'Bank statement deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete bank statement',
      );
    }
  }

  async reconcileEntry(
    request: FastifyRequest<{ Body: IReconcileBankStatementEntry }>,
    reply: FastifyReply,
  ) {
    try {
      const entry = await this.service.reconcileEntry(request.body);
      return sendSuccessResponse(reply, 200, entry);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to reconcile bank statement entry',
      );
    }
  }

  async unreconcileEntry(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const entry = await this.service.unreconcileEntry(request.params.id);
      return sendSuccessResponse(reply, 200, entry);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to unreconcile bank statement entry',
      );
    }
  }
}
