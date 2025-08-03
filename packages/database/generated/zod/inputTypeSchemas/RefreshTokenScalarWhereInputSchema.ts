import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const RefreshTokenScalarWhereInputSchema: z.ZodType<Prisma.RefreshTokenScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RefreshTokenScalarWhereInputSchema),z.lazy(() => RefreshTokenScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RefreshTokenScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RefreshTokenScalarWhereInputSchema),z.lazy(() => RefreshTokenScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  jti: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  familyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fingerprintHash: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  revokedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default RefreshTokenScalarWhereInputSchema;
