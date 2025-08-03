import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutRefreshTokensInputSchema } from './UserUpdateWithoutRefreshTokensInputSchema';
import { UserUncheckedUpdateWithoutRefreshTokensInputSchema } from './UserUncheckedUpdateWithoutRefreshTokensInputSchema';

export const UserUpdateToOneWithWhereWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRefreshTokensInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRefreshTokensInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutRefreshTokensInputSchema;
