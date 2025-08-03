import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { UserCreateWithoutRefreshTokensInputSchema } from './UserCreateWithoutRefreshTokensInputSchema';
import { UserUncheckedCreateWithoutRefreshTokensInputSchema } from './UserUncheckedCreateWithoutRefreshTokensInputSchema';
import { UserCreateOrConnectWithoutRefreshTokensInputSchema } from './UserCreateOrConnectWithoutRefreshTokensInputSchema';
import { UserUpsertWithoutRefreshTokensInputSchema } from './UserUpsertWithoutRefreshTokensInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutRefreshTokensInputSchema } from './UserUpdateToOneWithWhereWithoutRefreshTokensInputSchema';
import { UserUpdateWithoutRefreshTokensInputSchema } from './UserUpdateWithoutRefreshTokensInputSchema';
import { UserUncheckedUpdateWithoutRefreshTokensInputSchema } from './UserUncheckedUpdateWithoutRefreshTokensInputSchema';

export const UserUpdateOneRequiredWithoutRefreshTokensNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRefreshTokensNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutRefreshTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRefreshTokensInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutRefreshTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutRefreshTokensInputSchema),z.lazy(() => UserUpdateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRefreshTokensInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutRefreshTokensNestedInputSchema;
