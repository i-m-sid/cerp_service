import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomerTypeService } from './customer-type.service';
import {
  ICreateCustomerType,
  IUpdateCustomerType,
  IInternalCreateCustomerType,
} from './customer-type.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class CustomerTypeController {
  private service: CustomerTypeService;

  constructor() {
    this.service = new CustomerTypeService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateCustomerType }>,
    reply: FastifyReply,
  ) {
    try {
      const internalData: IInternalCreateCustomerType = {
        ...request.body,
        createdBy: request.user!.userId,
      };
      const customerType = await this.service.create(internalData);
      return sendSuccessResponse(reply, 201, customerType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to create customer type',
      );
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const customerTypes = await this.service.findAll();
      return sendSuccessResponse(reply, 200, customerTypes);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch customer types',
      );
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const customerType = await this.service.findById(request.params.id);
      if (!customerType) {
        return sendErrorResponse(reply, 404, null, 'Customer type not found');
      }
      return sendSuccessResponse(reply, 200, customerType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch customer type',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateCustomerType, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const customerType = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, customerType);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to update customer type',
      );
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const customerType = await this.service.delete(request.params.id);
      if (!customerType) {
        return sendErrorResponse(reply, 404, null, 'Customer type not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Customer type deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to delete customer type',
      );
    }
  }
}
