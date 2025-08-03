import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostCreateManyInputSchema } from '../inputTypeSchemas/PostCreateManyInputSchema'

export const PostCreateManyArgsSchema: z.ZodType<Prisma.PostCreateManyArgs> = z.object({
  data: z.union([ PostCreateManyInputSchema,PostCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostCreateManyArgsSchema;
