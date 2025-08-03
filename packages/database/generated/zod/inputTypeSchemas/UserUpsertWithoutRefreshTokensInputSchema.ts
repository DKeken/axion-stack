import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutRefreshTokensInputSchema } from './UserUpdateWithoutRefreshTokensInputSchema';
import { UserUncheckedUpdateWithoutRefreshTokensInputSchema } from './UserUncheckedUpdateWithoutRefreshTokensInputSchema';
import { UserCreateWithoutRefreshTokensInputSchema } from './UserCreateWithoutRefreshTokensInputSchema';
import { UserUncheckedCreateWithoutRefreshTokensInputSchema } from './UserUncheckedCreateWithoutRefreshTokensInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserUpsertWithoutRefreshTokensInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRefreshTokensInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutRefreshTokensInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutRefreshTokensInputSchema;
