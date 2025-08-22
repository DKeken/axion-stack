import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { MicroserviceRequest, MicroserviceResponse } from '@repo/common/types';
import type { CreateUserDto, UpdateUserDto, UserListQueryDto } from '@repo/contracts';

import { UsersService } from './users.service';

@Controller()
export class UsersMicroserviceController {
  private readonly logger = new Logger(UsersMicroserviceController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.list')
  async list(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing users.list request');

      const query = request.query as UserListQueryDto;
      const result = await this.usersService.list(query);

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in users.list:', error);
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to list users',
      };
    }
  }

  @MessagePattern('users.get')
  async get(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing users.get request');

      // Extract user ID from path (e.g., "/123" -> "123")
      const userId = request.path.replace('/', '');

      const result = await this.usersService.findById(userId);

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in users.get:', error);
      return {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  @MessagePattern('users.create')
  async create(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing users.create request');

      const createUserDto = request.body as CreateUserDto;
      const result = await this.usersService.create(createUserDto);

      return {
        status: 201,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in users.create:', error);
      return {
        status: error instanceof Error && error.message.includes('already exists') ? 409 : 500,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  @MessagePattern('users.update')
  async update(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing users.update request');

      // Extract user ID from path (e.g., "/123" -> "123")
      const userId = request.path.replace('/', '');
      const updateUserDto = request.body as UpdateUserDto;

      const result = await this.usersService.update(userId, updateUserDto);

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in users.update:', error);
      return {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  @MessagePattern('users.delete')
  async delete(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing users.delete request');

      // Extract user ID from path (e.g., "/123" -> "123")
      const userId = request.path.replace('/', '');

      await this.usersService.delete(userId);

      return {
        status: 200,
        data: { message: 'User deleted successfully' },
      };
    } catch (error) {
      this.logger.error('Error in users.delete:', error);
      return {
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }
}
