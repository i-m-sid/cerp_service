import { FastifyReply, FastifyRequest } from 'fastify';
import { StateCodeRepository } from './state-code.repository';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../utils/response-handler';

export class StateCodeController {
  private repository: StateCodeRepository;

  constructor() {
    this.repository = new StateCodeRepository();
  }

  async getAllStates(request: FastifyRequest, reply: FastifyReply) {
    const states = this.repository.getAllStates();
    sendSuccessResponse(reply, 200, states);
  }

  async getStateByCode(
    request: FastifyRequest<{ Params: { code: string } }>,
    reply: FastifyReply,
  ) {
    const { code } = request.params;
    const state = this.repository.getStateByCode(code);

    if (!state) {
      sendErrorResponse(reply, 404, 'State not found');
    }

    sendSuccessResponse(reply, 200, state);
  }

  async getStateByAlphaCode(
    request: FastifyRequest<{ Params: { alphaCode: string } }>,
    reply: FastifyReply,
  ) {
    const { alphaCode } = request.params;
    const state = this.repository.getStateByAlphaCode(alphaCode.toUpperCase());

    if (!state) {
      sendErrorResponse(reply, 404, 'State not found');
    }

    sendSuccessResponse(reply, 200, state);
  }

  async getStateByName(
    request: FastifyRequest<{ Params: { name: string } }>,
    reply: FastifyReply,
  ) {
    const { name } = request.params;
    const state = this.repository.getStateByName(name);

    if (!state) {
      sendErrorResponse(reply, 404, 'State not found');
    }

    sendSuccessResponse(reply, 200, state);
  }
}
