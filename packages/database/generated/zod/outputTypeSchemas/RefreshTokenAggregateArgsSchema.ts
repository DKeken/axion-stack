import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'
import { RefreshTokenOrderByWithRelationInputSchema } from '../inputTypeSchemas/RefreshTokenOrderByWithRelationInputSchema'
import { RefreshTokenWhereUniqueInputSchema } from '../inputTypeSchemas/RefreshTokenWhereUniqueInputSchema'

export const RefreshTokenAggregateArgsSchema: z.ZodType<Prisma.RefreshTokenAggregateArgs> = z.object({
  where: RefreshTokenWhereInputSchema.optional(),
  orderBy: z.union([ RefreshTokenOrderByWithRelationInputSchema.array(),RefreshTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: RefreshTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default RefreshTokenAggregateArgsSchema;
