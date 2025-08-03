import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';
import { UserCreateNestedOneWithoutPostsInputSchema } from './UserCreateNestedOneWithoutPostsInputSchema';

export const PostCreateInputSchema: z.ZodType<Prisma.PostCreateInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().optional().nullable(),
  published: z.boolean().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  author: z.lazy(() => UserCreateNestedOneWithoutPostsInputSchema)
}).strict();

export default PostCreateInputSchema;
