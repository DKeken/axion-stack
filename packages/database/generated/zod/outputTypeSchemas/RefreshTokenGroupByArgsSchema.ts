import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'
import { RefreshTokenOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RefreshTokenOrderByWithAggregationInputSchema'
import { RefreshTokenScalarFieldEnumSchema } from '../inputTypeSchemas/RefreshTokenScalarFieldEnumSchema'
import { RefreshTokenScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RefreshTokenScalarWhereWithAggregatesInputSchema'

export const RefreshTokenGroupByArgsSchema: z.ZodType<Prisma.RefreshTokenGroupByArgs> = z.object({
  where: RefreshTokenWhereInputSchema.optional(),
  orderBy: z.union([ RefreshTokenOrderByWithAggregationInputSchema.array(),RefreshTokenOrderByWithAggregationInputSchema ]).optional(),
  by: RefreshTokenScalarFieldEnumSchema.array(),
  having: RefreshTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default RefreshTokenGroupByArgsSchema;
