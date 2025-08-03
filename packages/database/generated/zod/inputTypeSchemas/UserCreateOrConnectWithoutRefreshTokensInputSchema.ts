import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutRefreshTokensInputSchema } from './UserCreateWithoutRefreshTokensInputSchema';
import { UserUncheckedCreateWithoutRefreshTokensInputSchema } from './UserUncheckedCreateWithoutRefreshTokensInputSchema';

export const UserCreateOrConnectWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRefreshTokensInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRefreshTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutRefreshTokensInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutRefreshTokensInputSchema;
