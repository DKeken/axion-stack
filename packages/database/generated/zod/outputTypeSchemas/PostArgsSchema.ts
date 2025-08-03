import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostSelectSchema } from '../inputTypeSchemas/PostSelectSchema';
import { PostIncludeSchema } from '../inputTypeSchemas/PostIncludeSchema';

export const PostArgsSchema: z.ZodType<Prisma.PostDefaultArgs> = z.object({
  select: z.lazy(() => PostSelectSchema).optional(),
  include: z.lazy(() => PostIncludeSchema).optional(),
}).strict();

export default PostArgsSchema;
