import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenIncludeSchema } from '../inputTypeSchemas/RefreshTokenIncludeSchema'
import { RefreshTokenCreateInputSchema } from '../inputTypeSchemas/RefreshTokenCreateInputSchema'
import { RefreshTokenUncheckedCreateInputSchema } from '../inputTypeSchemas/RefreshTokenUncheckedCreateInputSchema'
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

export const RefreshTokenCreateArgsSchema: z.ZodType<Prisma.RefreshTokenCreateArgs> = z.object({
  select: RefreshTokenSelectSchema.optional(),
  include: z.lazy(() => RefreshTokenIncludeSchema).optional(),
  data: z.union([ RefreshTokenCreateInputSchema,RefreshTokenUncheckedCreateInputSchema ]),
}).strict() ;

export default RefreshTokenCreateArgsSchema;
