import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenCreateManyInputSchema } from '../inputTypeSchemas/RefreshTokenCreateManyInputSchema'

export const RefreshTokenCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RefreshTokenCreateManyAndReturnArgs> = z.object({
  data: z.union([ RefreshTokenCreateManyInputSchema,RefreshTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RefreshTokenCreateManyAndReturnArgsSchema;
