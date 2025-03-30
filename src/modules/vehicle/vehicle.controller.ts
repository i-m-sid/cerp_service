import { FastifyReply, FastifyRequest } from 'fastify';
import { VehicleService } from './vehicle.service';
import { ICreateVehicle, IUpdateVehicle } from './vehicle.interface';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../../utils/response-handler';

export class VehicleController {
  private service: VehicleService;

  constructor() {
    this.service = new VehicleService();
  }

  async create(
    request: FastifyRequest<{ Body: ICreateVehicle }>,
    reply: FastifyReply,
  ) {
    try {
      const vehicle = await this.service.create(request.body);
      return sendSuccessResponse(reply, 201, vehicle);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to create vehicle');
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const vehicles = await this.service.findAll();
      return sendSuccessResponse(reply, 200, vehicles);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch vehicles');
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const vehicle = await this.service.findById(request.params.id);
      if (!vehicle) {
        return sendErrorResponse(reply, 404, null, 'Vehicle not found');
      }
      return sendSuccessResponse(reply, 200, vehicle);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to fetch vehicle');
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Omit<IUpdateVehicle, 'id'>;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const vehicle = await this.service.update({
        id: request.params.id,
        ...request.body,
      });
      return sendSuccessResponse(reply, 200, vehicle);
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to update vehicle');
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const vehicle = await this.service.delete(request.params.id);
      if (!vehicle) {
        return sendErrorResponse(reply, 404, null, 'Vehicle not found');
      }
      return sendSuccessResponse(reply, 200, {
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      request.log.error(error);
      return sendErrorResponse(reply, 500, error, 'Failed to delete vehicle');
    }
  }
}
