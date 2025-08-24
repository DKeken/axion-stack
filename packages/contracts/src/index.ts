// Export all contracts
export * from './auth.contract';
// Export common types
export type { FilterOperator } from './common/dto/filtering.dto';
// Export common schemas
export * from './common/dto/filtering.dto';
export * from './common/dto/pagination.dto';
export * from './common/dto/search.dto';
export type { SortOrder } from './common/dto/sorting.dto';
export * from './common/dto/sorting.dto';
export * from './users.contract';

// Export service routes generator (Single Source of Truth)
export * from './service-routes';

// Export the main API contract
import { initContract } from '@ts-rest/core';

import { authContract } from './auth.contract';
import { usersContract } from './users.contract';

const c = initContract();

export const apiContract = c.router({
  auth: authContract,
  users: usersContract,
});

export type ApiContract = typeof apiContract;
