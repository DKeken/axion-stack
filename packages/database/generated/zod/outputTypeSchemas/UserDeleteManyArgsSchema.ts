import { z } from 'zod';
import type { Prisma } from '../../../node_modules/.prisma/client';
import { UserWhereInputSchema } from '../inputTypeSchemas/UserWhereInputSchema'

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export default UserDeleteManyArgsSchema;
