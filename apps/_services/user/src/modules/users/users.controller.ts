import { Controller } from '@nestjs/common';
import { Public } from '@repo/common';
import { usersContract, type UserListResponse, type UserResponse } from '@repo/contracts';
import { ApiCacheService } from '@repo/infrastructure';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import {
  UserCreateErrors,
  UserDeleteErrors,
  UserGetErrors,
  UserListErrors,
  UserUpdateErrors,
} from './errors';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiCacheService: ApiCacheService
  ) {}

  @Public()
  @TsRestHandler(usersContract.listAll)
  async list() {
    return tsRestHandler(usersContract.listAll, async ({ query }) => {
      try {
        // Try to get from cache first
        const cached = await this.apiCacheService.get<UserListResponse>({
          module: 'users',
          operation: 'list',
          params: query,
        });

        if (cached) {
          return {
            status: 200 as const,
            body: cached,
          };
        }

        const result = await this.usersService.list(query);

        // Cache the result
        await this.apiCacheService.cache(
          {
            module: 'users',
            operation: 'list',
            params: query,
          },
          result,
          { ttl: this.apiCacheService.getTTLForOperation('users', 'list') }
        );

        return {
          status: 200 as const,
          body: result,
        };
      } catch (error) {
        return {
          status: 400 as const,
          body: UserListErrors.badRequest(error instanceof Error ? error.message : undefined),
        };
      }
    });
  }

  @TsRestHandler(usersContract.getById)
  async getById() {
    return tsRestHandler(usersContract.getById, async ({ params }) => {
      try {
        // Try to get from cache first
        const cached = await this.apiCacheService.get<UserResponse>({
          module: 'users',
          operation: 'getById',
          params: { id: params.id },
        });

        if (cached) {
          return {
            status: 200 as const,
            body: cached,
          };
        }

        const user = await this.usersService.findById(params.id);

        // Cache the result
        await this.apiCacheService.cache(
          {
            module: 'users',
            operation: 'getById',
            params: { id: params.id },
          },
          user,
          { ttl: this.apiCacheService.getTTLForOperation('users', 'getById') }
        );

        return {
          status: 200 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return {
            status: 404 as const,
            body: UserGetErrors.notFound(params.id),
          };
        }

        return {
          status: 400 as const,
          body: UserGetErrors.badRequest(
            params.id,
            error instanceof Error ? error.message : undefined
          ),
        };
      }
    });
  }

  @TsRestHandler(usersContract.create)
  async create() {
    return tsRestHandler(usersContract.create, async ({ body }) => {
      try {
        const user = await this.usersService.create(body);

        // Invalidate API cache after creation
        await this.apiCacheService.invalidateModule('users');

        return {
          status: 201 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return {
            status: 409 as const,
            body: UserCreateErrors.conflict(error.message),
          };
        }

        return {
          status: 400 as const,
          body: UserCreateErrors.badRequest(error instanceof Error ? error.message : undefined),
        };
      }
    });
  }

  @TsRestHandler(usersContract.update)
  async update() {
    return tsRestHandler(usersContract.update, async ({ params, body }) => {
      try {
        const user = await this.usersService.update(params.id, body);

        // Invalidate API cache after update
        await this.apiCacheService.invalidateModule('users');

        return {
          status: 200 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return {
            status: 404 as const,
            body: UserUpdateErrors.notFound(params.id),
          };
        }

        if (error instanceof Error && error.message.includes('already exists')) {
          return {
            status: 409 as const,
            body: UserUpdateErrors.conflict(params.id, error.message),
          };
        }

        return {
          status: 400 as const,
          body: UserUpdateErrors.badRequest(
            params.id,
            error instanceof Error ? error.message : undefined
          ),
        };
      }
    });
  }

  @TsRestHandler(usersContract.delete)
  async delete() {
    return tsRestHandler(usersContract.delete, async ({ params }) => {
      try {
        await this.usersService.delete(params.id);

        // Invalidate API cache after deletion
        await this.apiCacheService.invalidateModule('users');

        return {
          status: 200 as const,
          body: {
            message: 'User deleted successfully',
          },
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return {
            status: 404 as const,
            body: UserDeleteErrors.notFound(params.id),
          };
        }

        return {
          status: 400 as const,
          body: UserDeleteErrors.badRequest(
            params.id,
            error instanceof Error ? error.message : undefined
          ),
        };
      }
    });
  }
}
