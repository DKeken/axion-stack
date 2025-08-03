import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutRefreshTokensInputSchema } from './UserCreateWithoutRefreshTokensInputSchema';
import { UserUncheckedCreateWithoutRefreshTokensInputSchema } from './UserUncheckedCreateWithoutRefreshTokensInputSchema';
import { UserCreateOrConnectWithoutRefreshTokensInputSchema } from './UserCreateOrConnectWithoutRefreshTokensInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRefreshTokensInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutRefreshTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRefreshTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutRefreshTokensInputSchema;
