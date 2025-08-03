// Re-export Prisma client and types
export { PrismaClient, Prisma } from '@prisma/client';
export type { User, RefreshToken, Post, UserStatus } from '@prisma/client';

// Re-export generated zod schemas
// Note: Import directly from '@repo/database/generated/zod' when needed
export * from '../generated/zod';
