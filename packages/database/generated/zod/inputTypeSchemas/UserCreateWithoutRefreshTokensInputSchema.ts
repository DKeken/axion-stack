import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedManyWithoutAuthorInputSchema } from './PostCreateNestedManyWithoutAuthorInputSchema';

export const UserCreateWithoutRefreshTokensInputSchema: z.ZodType<Prisma.UserCreateWithoutRefreshTokensInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  name: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  posts: z.lazy(() => PostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export default UserCreateWithoutRefreshTokensInputSchema;
