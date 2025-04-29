import { FastifyReply, FastifyRequest } from 'fastify';
import { LedgerService } from './ledger.service';
import {
  ICreateLedgerAccountCategory,
  IUpdateLedgerAccountCategory,
  ICreateLedgerAccount,
  IUpdateLedgerAccount,
} from './ledger.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';
import { LedgerAccountType } from '@prisma/client';

export class LedgerController {
  private service: LedgerService;

  constructor() {
    this.service = new LedgerService();
  }

  // Category
  async createCategory(
    request: FastifyRequest<{
      Body: Omit<ICreateLedgerAccountCategory, 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.createCategory({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create category');
    }
  }

  async findAllCategories(
    request: FastifyRequest<{
      Querystring: {
        accountType?: LedgerAccountType;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { accountType } = request.query;
      const categories = await this.service.findAllCategories(
        request.user!.orgId!,
        accountType,
      );
      return sendSuccessResponse(reply, 200, categories);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch categories');
    }
  }

  async findCategoryById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.findCategoryById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!category) {
        return sendErrorResponse(reply, 404, null, 'Category not found');
      }
      return sendSuccessResponse(reply, 200, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch category');
    }
  }

  async updateCategory(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateLedgerAccountCategory, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.updateCategory({
        id: request.params.id,
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 200, category);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update category');
    }
  }

  async deleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const category = await this.service.deleteCategory(request.params.id);
      if (!category) {
        return sendErrorResponse(reply, 404, null, 'Category not found');
      }
      return sendSuccessResponse(reply, 204, {
        message: 'Category deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete category');
    }
  }

  // Account
  async createAccount(
    request: FastifyRequest<{ Body: Omit<ICreateLedgerAccount, 'orgId'> }>,
    reply: FastifyReply,
  ) {
    try {
      const account = await this.service.createAccount({
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 201, account);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create account');
    }
  }

  async findAllAccounts(
    request: FastifyRequest<{
      Querystring: {
        categoryId?: string;
        partyId?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { categoryId, partyId } = request.query;
      const accounts = await this.service.findAllAccounts(
        request.user!.orgId!,
        categoryId,
        partyId,
      );
      return sendSuccessResponse(reply, 200, accounts);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch accounts');
    }
  }

  async findAccountById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const account = await this.service.findAccountById(
        request.params.id,
        request.user!.orgId!,
      );
      if (!account) {
        return sendErrorResponse(reply, 404, null, 'Account not found');
      }
      return sendSuccessResponse(reply, 200, account);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch account');
    }
  }

  async updateAccount(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateLedgerAccount, 'id' | 'orgId'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const account = await this.service.updateAccount({
        id: request.params.id,
        ...request.body,
        orgId: request.user!.orgId!,
      });
      return sendSuccessResponse(reply, 200, account);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update account');
    }
  }

  async deleteAccount(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const account = await this.service.deleteAccount(request.params.id);
      if (!account) {
        return sendErrorResponse(reply, 404, null, 'Account not found');
      }
      return sendSuccessResponse(reply, 204, {
        message: 'Account deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete account');
    }
  }
}
