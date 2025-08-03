import { initContract } from '@ts-rest/core';

import { authContract } from './auth.contract';
import { usersContract } from './users.contract';

const c = initContract();

export const apiContract = c.router({
  auth: authContract,
  users: usersContract,
});

export type ApiContract = typeof apiContract;

// Re-export individual contracts
export { authContract, usersContract };

// Re-export types
export type {
  AuthContract,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  TokensResponse,
  UserResponse as AuthUserResponse,
  AuthResponse,
} from './auth.contract';

export type {
  UsersContract,
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UserParamsDto,
  UserListQueryDto,
  UserResponse,
  UserListResponse,
} from './users.contract';
