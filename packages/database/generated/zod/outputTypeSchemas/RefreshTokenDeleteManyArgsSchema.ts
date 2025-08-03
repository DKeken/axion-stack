import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'

export const RefreshTokenDeleteManyArgsSchema: z.ZodType<Prisma.RefreshTokenDeleteManyArgs> = z.object({
  where: RefreshTokenWhereInputSchema.optional(),
}).strict() ;

export default RefreshTokenDeleteManyArgsSchema;
