import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  TsRestValidationUtils,
  type MicroserviceRequestPayload,
  type MicroserviceResponse,
} from '@repo/common';
import { usersContract } from '@repo/contracts';

import { UsersService } from './users.service';

@Controller()
export class UsersMicroserviceController {
  private readonly logger = new Logger(UsersMicroserviceController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('health.check')
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'users',
    };
  }

  @MessagePattern('users.listAll')
  async listAll(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(usersContract.listAll, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    try {
      // validation.data.query is now properly typed and validated
      const result = await this.usersService.list(validation.data.query || {});
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Users list error:', error);
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Failed to list users',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('users.getById')
  async getById(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(usersContract.getById, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.pathParams) {
      return TsRestValidationUtils.createErrorResponse(400, 'Path parameters are required');
    }

    try {
      // validation.data.pathParams is now properly typed and validated
      const id = validation.data.pathParams?.id;
      if (!id) {
        return TsRestValidationUtils.createErrorResponse(400, 'User ID is required');
      }
      const result = await this.usersService.findById(id);
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Users getById error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        return TsRestValidationUtils.createErrorResponse(404, 'User not found');
      }
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Failed to get user',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('users.create')
  async create(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(usersContract.create, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.body) {
      return TsRestValidationUtils.createErrorResponse(400, 'Request body is required');
    }

    try {
      // validation.data.body is now properly typed and validated
      const result = await this.usersService.create(validation.data.body);
      return TsRestValidationUtils.createResponse(201, result);
    } catch (error) {
      this.logger.error('Users create error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        return TsRestValidationUtils.createErrorResponse(409, 'User already exists');
      }
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Failed to create user',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('users.update')
  async update(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(usersContract.update, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.pathParams) {
      return TsRestValidationUtils.createErrorResponse(400, 'Path parameters are required');
    }

    if (!validation.data.body) {
      return TsRestValidationUtils.createErrorResponse(400, 'Request body is required');
    }

    try {
      const id = validation.data.pathParams?.id;
      if (!id) {
        return TsRestValidationUtils.createErrorResponse(400, 'User ID is required');
      }

      const result = await this.usersService.update(id, validation.data.body);
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Users update error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        return TsRestValidationUtils.createErrorResponse(404, 'User not found');
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        return TsRestValidationUtils.createErrorResponse(409, 'User already exists');
      }
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Failed to update user',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('users.delete')
  async delete(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(usersContract.delete, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.pathParams) {
      return TsRestValidationUtils.createErrorResponse(400, 'Path parameters are required');
    }

    try {
      const id = validation.data.pathParams?.id;
      if (!id) {
        return TsRestValidationUtils.createErrorResponse(400, 'User ID is required');
      }

      await this.usersService.delete(id);
      return TsRestValidationUtils.createResponse(200, { message: 'User deleted successfully' });
    } catch (error) {
      this.logger.error('Users delete error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        return TsRestValidationUtils.createErrorResponse(404, 'User not found');
      }
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Failed to delete user',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
