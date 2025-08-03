import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';

export const PostCreateManyInputSchema: z.ZodType<Prisma.PostCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().optional().nullable(),
  published: z.boolean().optional(),
  authorId: z.string(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default PostCreateManyInputSchema;
