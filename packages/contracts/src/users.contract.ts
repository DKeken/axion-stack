import { UserOptionalDefaultsSchema, UserSchema } from '@repo/database/generated/zod';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import { filteringSchema } from './common/dto/filtering.dto';
import { paginationResponseSchema, paginationSchema } from './common/dto/pagination.dto';
import { searchSchema } from './common/dto/search.dto';
import { sortingSchema } from './common/dto/sorting.dto';

const c = initContract();

// User schemas (Prisma Zod-based)
const userResponseSchema = UserSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const createUserSchema = UserOptionalDefaultsSchema.pick({
  email: true,
  name: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

const userParamsSchema = z.object({
  id: z.string().cuid('Invalid user ID format'),
});

// Query schemas
const userListQuerySchema = paginationSchema
  .merge(sortingSchema)
  .merge(filteringSchema)
  .merge(searchSchema);

const userListResponseSchema = paginationResponseSchema(userResponseSchema);

const errorSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  method: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  details: z
    .object({
      field: z.string().optional(),
      constraint: z.string().optional(),
      table: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),
});

export const usersContract = c.router({
  listAll: {
    method: 'GET',
    path: '/api/v1/users',
    query: userListQuerySchema,
    responses: {
      200: userListResponseSchema,
      400: errorSchema,
      401: errorSchema,
    },
    summary: 'List users with pagination, filtering, sorting, and search',
    description: 'Get paginated list of users with advanced query capabilities',
  },

  getById: {
    method: 'GET',
    path: '/api/v1/users/:id',
    pathParams: userParamsSchema,
    responses: {
      200: userResponseSchema,
      400: errorSchema,
      401: errorSchema,
      404: errorSchema,
    },
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  },

  create: {
    method: 'POST',
    path: '/api/v1/users',
    body: createUserSchema,
    responses: {
      201: userResponseSchema,
      400: errorSchema,
      401: errorSchema,
      409: errorSchema,
    },
    summary: 'Create a new user',
    description: 'Create a new user account',
  },

  update: {
    method: 'PATCH',
    path: '/api/v1/users/:id',
    pathParams: userParamsSchema,
    body: updateUserSchema,
    responses: {
      200: userResponseSchema,
      400: errorSchema,
      401: errorSchema,
      404: errorSchema,
      409: errorSchema,
    },
    summary: 'Update user',
    description: 'Update user information',
  },

  delete: {
    method: 'DELETE',
    path: '/api/v1/users/:id',
    pathParams: userParamsSchema,
    body: z.object({}), // Пустой body для генерации useMutation
    responses: {
      200: z.object({ message: z.string() }),
      400: errorSchema,
      401: errorSchema,
      404: errorSchema,
    },
    summary: 'Delete user',
    description: 'Delete a user account',
  },
});

export type UsersContract = typeof usersContract;

// Type exports for use in services
export type UserDto = z.infer<typeof userResponseSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserParamsDto = z.infer<typeof userParamsSchema>;
export type UserListQueryDto = z.infer<typeof userListQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
