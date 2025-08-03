import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenIncludeSchema } from '../inputTypeSchemas/RefreshTokenIncludeSchema'
import { RefreshTokenWhereUniqueInputSchema } from '../inputTypeSchemas/RefreshTokenWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RefreshTokenSelectSchema: z.ZodType<Prisma.RefreshTokenSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  jti: z.boolean().optional(),
  familyId: z.boolean().optional(),
  fingerprintHash: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  revokedAt: z.boolean().optional(),
  usedAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const RefreshTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RefreshTokenFindUniqueOrThrowArgs> = z.object({
  select: RefreshTokenSelectSchema.optional(),
  include: z.lazy(() => RefreshTokenIncludeSchema).optional(),
  where: RefreshTokenWhereUniqueInputSchema,
}).strict() ;

export default RefreshTokenFindUniqueOrThrowArgsSchema;
