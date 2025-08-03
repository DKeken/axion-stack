import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';

export const PostUncheckedCreateInputSchema: z.ZodType<Prisma.PostUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().optional().nullable(),
  published: z.boolean().optional(),
  authorId: z.string(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default PostUncheckedCreateInputSchema;
