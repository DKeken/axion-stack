import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenCreateManyInputSchema } from '../inputTypeSchemas/RefreshTokenCreateManyInputSchema'

export const RefreshTokenCreateManyArgsSchema: z.ZodType<Prisma.RefreshTokenCreateManyArgs> = z.object({
  data: z.union([ RefreshTokenCreateManyInputSchema,RefreshTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RefreshTokenCreateManyArgsSchema;
