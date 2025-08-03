import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostCreateManyInputSchema } from '../inputTypeSchemas/PostCreateManyInputSchema'

export const PostCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PostCreateManyAndReturnArgs> = z.object({
  data: z.union([ PostCreateManyInputSchema,PostCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostCreateManyAndReturnArgsSchema;
