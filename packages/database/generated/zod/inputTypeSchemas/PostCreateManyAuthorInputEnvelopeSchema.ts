import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateManyAuthorInputSchema } from './PostCreateManyAuthorInputSchema';

export const PostCreateManyAuthorInputEnvelopeSchema: z.ZodType<Prisma.PostCreateManyAuthorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostCreateManyAuthorInputSchema),z.lazy(() => PostCreateManyAuthorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostCreateManyAuthorInputEnvelopeSchema;
