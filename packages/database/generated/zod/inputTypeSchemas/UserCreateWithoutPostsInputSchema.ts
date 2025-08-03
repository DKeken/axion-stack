import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenCreateNestedManyWithoutUserInputSchema } from './RefreshTokenCreateNestedManyWithoutUserInputSchema';

export const UserCreateWithoutPostsInputSchema: z.ZodType<Prisma.UserCreateWithoutPostsInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  name: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  refreshTokens: z.lazy(() => RefreshTokenCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export default UserCreateWithoutPostsInputSchema;
