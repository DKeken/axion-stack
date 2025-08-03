import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { EnumUserStatusWithAggregatesFilterSchema } from './EnumUserStatusWithAggregatesFilterSchema';
import { UserStatusSchema } from './UserStatusSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const PostScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PostScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PostScalarWhereWithAggregatesInputSchema),z.lazy(() => PostScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostScalarWhereWithAggregatesInputSchema),z.lazy(() => PostScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  published: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  authorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusWithAggregatesFilterSchema),z.lazy(() => UserStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default PostScalarWhereWithAggregatesInputSchema;
