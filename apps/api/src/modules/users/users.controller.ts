import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import { UsersService } from './users.service';

import { usersContract } from '@/contracts/users.contract';
import { Public } from '@/modules/auth/decorators/public.decorator';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @TsRestHandler(usersContract.list)
  async list() {
    return tsRestHandler(usersContract.list, async ({ query }) => {
      try {
        const result = await this.usersService.list(query);

        return {
          status: 200 as const,
          body: result,
        };
      } catch (error) {
        return {
          status: 400 as const,
          body: {
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: '/api/v1/users',
            method: 'GET',
            message: error instanceof Error ? error.message : 'Failed to fetch users',
            error: 'Bad Request',
          },
        };
      }
    });
  }

  @TsRestHandler(usersContract.getById)
  async getById() {
    return tsRestHandler(usersContract.getById, async ({ params }) => {
      try {
        const user = await this.usersService.findById(params.id);

        return {
          status: 200 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return {
            status: 404 as const,
            body: {
              statusCode: 404,
              timestamp: new Date().toISOString(),
              path: `/api/v1/users/${params.id}`,
              method: 'GET',
              message: 'User not found',
              error: 'Not Found',
            },
          };
        }

        return {
          status: 400 as const,
          body: {
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: `/api/v1/users/${params.id}`,
            method: 'GET',
            message: error instanceof Error ? error.message : 'Failed to fetch user',
            error: 'Bad Request',
          },
        };
      }
    });
  }

  @TsRestHandler(usersContract.create)
  async create() {
    return tsRestHandler(usersContract.create, async ({ body }) => {
      try {
        const user = await this.usersService.create(body);

        return {
          status: 201 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return {
            status: 409 as const,
            body: {
              statusCode: 409,
              timestamp: new Date().toISOString(),
              path: '/api/v1/users',
              method: 'POST',
              message: error.message,
              error: 'Conflict',
            },
          };
        }

        return {
          status: 400 as const,
          body: {
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: '/api/v1/users',
            method: 'POST',
            message: error instanceof Error ? error.message : 'Failed to create user',
            error: 'Bad Request',
          },
        };
      }
    });
  }

  @TsRestHandler(usersContract.update)
  async update() {
    return tsRestHandler(usersContract.update, async ({ params, body }) => {
      try {
        const user = await this.usersService.update(params.id, body);

        return {
          status: 200 as const,
          body: user,
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return {
            status: 404 as const,
            body: {
              statusCode: 404,
              timestamp: new Date().toISOString(),
              path: `/api/v1/users/${params.id}`,
              method: 'PATCH',
              message: 'User not found',
              error: 'Not Found',
            },
          };
        }

        if (error instanceof Error && error.message.includes('already exists')) {
          return {
            status: 409 as const,
            body: {
              statusCode: 409,
              timestamp: new Date().toISOString(),
              path: `/api/v1/users/${params.id}`,
              method: 'PATCH',
              message: error.message,
              error: 'Conflict',
            },
          };
        }

        return {
          status: 400 as const,
          body: {
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: `/api/v1/users/${params.id}`,
            method: 'PATCH',
            message: error instanceof Error ? error.message : 'Failed to update user',
            error: 'Bad Request',
          },
        };
      }
    });
  }

  @TsRestHandler(usersContract.delete)
  async delete() {
    return tsRestHandler(usersContract.delete, async ({ params }) => {
      try {
        await this.usersService.delete(params.id);

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
            body: {
              statusCode: 404,
              timestamp: new Date().toISOString(),
              path: `/api/v1/users/${params.id}`,
              method: 'DELETE',
              message: 'User not found',
              error: 'Not Found',
            },
          };
        }

        return {
          status: 400 as const,
          body: {
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: `/api/v1/users/${params.id}`,
            method: 'DELETE',
            message: error instanceof Error ? error.message : 'Failed to delete user',
            error: 'Bad Request',
          },
        };
      }
    });
  }
}
