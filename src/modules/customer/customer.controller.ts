import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomerService } from './customer.service';
import { ICreateCustomer, IUpdateCustomer } from './customer.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class CustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateCustomer }>,
    reply: FastifyReply,
  ) {
    try {
      const customer = await this.service.create(request.body);
      return sendSuccessResponse(reply, 201, customer);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create customer');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const customers = await this.service.findAll();
      console.log(customers);
      return sendSuccessResponse(reply, 200, customers);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch customers');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const customer = await this.service.findById(request.params.id);
      if (!customer) {
        return sendErrorResponse(reply, 404, null, 'Customer not found');
      }
      return sendSuccessResponse(reply, 200, customer);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch customer');
    }
  }

  async findByCustomerType(
    request: FastifyRequest<{ Params: { customerTypeId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const customers = await this.service.findByCustomerType(
        request.params.customerTypeId,
      );
      return sendSuccessResponse(reply, 200, customers);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(
        reply,
        500,
        error,
        'Failed to fetch customers by type',
      );
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateCustomer, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    console.log(request.body);
    try {
      const customer = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, customer);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update customer');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const customer = await this.service.delete(request.params.id);
      if (!customer) {
        return sendErrorResponse(reply, 404, null, 'Customer not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete customer');
    }
  }
}
