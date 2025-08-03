import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutPostsInputSchema } from './UserUpdateWithoutPostsInputSchema';
import { UserUncheckedUpdateWithoutPostsInputSchema } from './UserUncheckedUpdateWithoutPostsInputSchema';

export const UserUpdateToOneWithWhereWithoutPostsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPostsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPostsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPostsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutPostsInputSchema;
