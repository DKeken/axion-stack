import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { RefreshTokenUpdateManyMutationInputSchema } from '../inputTypeSchemas/RefreshTokenUpdateManyMutationInputSchema'
import { RefreshTokenUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RefreshTokenUncheckedUpdateManyInputSchema'
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'

export const RefreshTokenUpdateManyArgsSchema: z.ZodType<Prisma.RefreshTokenUpdateManyArgs> = z.object({
  data: z.union([ RefreshTokenUpdateManyMutationInputSchema,RefreshTokenUncheckedUpdateManyInputSchema ]),
  where: RefreshTokenWhereInputSchema.optional(),
}).strict() ;

export default RefreshTokenUpdateManyArgsSchema;
