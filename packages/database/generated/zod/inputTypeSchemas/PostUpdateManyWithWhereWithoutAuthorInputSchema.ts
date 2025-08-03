import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostScalarWhereInputSchema } from './PostScalarWhereInputSchema';
import { PostUpdateManyMutationInputSchema } from './PostUpdateManyMutationInputSchema';
import { PostUncheckedUpdateManyWithoutAuthorInputSchema } from './PostUncheckedUpdateManyWithoutAuthorInputSchema';

export const PostUpdateManyWithWhereWithoutAuthorInputSchema: z.ZodType<Prisma.PostUpdateManyWithWhereWithoutAuthorInput> = z.object({
  where: z.lazy(() => PostScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostUpdateManyMutationInputSchema),z.lazy(() => PostUncheckedUpdateManyWithoutAuthorInputSchema) ]),
}).strict();

export default PostUpdateManyWithWhereWithoutAuthorInputSchema;
