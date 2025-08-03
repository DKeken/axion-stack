import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { PostUncheckedCreateNestedManyWithoutAuthorInputSchema } from './PostUncheckedCreateNestedManyWithoutAuthorInputSchema';

export const UserUncheckedCreateWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRefreshTokensInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  name: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export default UserUncheckedCreateWithoutRefreshTokensInputSchema;
