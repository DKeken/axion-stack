import type { PrismaClient } from '@repo/database';

/**
 * Cursor-based pagination options
 */
export interface CursorPaginationOptions {
  limit: number;
  cursor?: string;
}

/**
 * Offset-based pagination options
 */
export interface OffsetPaginationOptions {
  limit: number;
  offset: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string | null | undefined;
  hasMore: boolean;
  total?: number;
}

/**
 * Type for Prisma transaction client (excludes top-level methods)
 */
export type TxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$use' | '$transaction' | '$extends'
>;

/**
 * Unit of Work pattern for Prisma transactions
 * Provides a way to group multiple operations in a single transaction
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: TxClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  }
): Promise<T> {
  const transactionOptions: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  } = {
    maxWait: options?.maxWait ?? 5000, // default 5 seconds
    timeout: options?.timeout ?? 10000, // default 10 seconds
  };

  if (options?.isolationLevel !== undefined) {
    transactionOptions.isolationLevel = options.isolationLevel;
  }

  return prisma.$transaction(fn, transactionOptions);
}

/**
 * Type guard to check if a client is a transaction client
 */
export function isTxClient(client: PrismaClient | TxClient): client is TxClient {
  return !('$transaction' in client);
}

/**
 * Helper type for services that can work with both regular and transaction clients
 */
export type DatabaseClient = PrismaClient | TxClient;
