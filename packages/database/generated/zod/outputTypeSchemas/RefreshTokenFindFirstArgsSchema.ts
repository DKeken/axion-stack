import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { RefreshTokenIncludeSchema } from '../inputTypeSchemas/RefreshTokenIncludeSchema'
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'
import { RefreshTokenOrderByWithRelationInputSchema } from '../inputTypeSchemas/RefreshTokenOrderByWithRelationInputSchema'
import { RefreshTokenWhereUniqueInputSchema } from '../inputTypeSchemas/RefreshTokenWhereUniqueInputSchema'
import { RefreshTokenScalarFieldEnumSchema } from '../inputTypeSchemas/RefreshTokenScalarFieldEnumSchema'
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

export const RefreshTokenFindFirstArgsSchema: z.ZodType<Prisma.RefreshTokenFindFirstArgs> = z.object({
  select: RefreshTokenSelectSchema.optional(),
  include: z.lazy(() => RefreshTokenIncludeSchema).optional(),
  where: RefreshTokenWhereInputSchema.optional(),
  orderBy: z.union([ RefreshTokenOrderByWithRelationInputSchema.array(),RefreshTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: RefreshTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RefreshTokenScalarFieldEnumSchema,RefreshTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default RefreshTokenFindFirstArgsSchema;
