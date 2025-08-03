import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { RefreshTokenListRelationFilterSchema } from './RefreshTokenListRelationFilterSchema';
import { PostListRelationFilterSchema } from './PostListRelationFilterSchema';

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    email: z.string().email()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    email: z.string().email(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  email: z.string().email().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  passwordHash: z.union([ z.lazy(() => StringFilterSchema),z.string().min(8) ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  refreshTokens: z.lazy(() => RefreshTokenListRelationFilterSchema).optional(),
  posts: z.lazy(() => PostListRelationFilterSchema).optional()
}).strict());

export default UserWhereUniqueInputSchema;
