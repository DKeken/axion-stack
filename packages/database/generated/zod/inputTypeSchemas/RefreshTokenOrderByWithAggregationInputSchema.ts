import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { RefreshTokenCountOrderByAggregateInputSchema } from './RefreshTokenCountOrderByAggregateInputSchema';
import { RefreshTokenMaxOrderByAggregateInputSchema } from './RefreshTokenMaxOrderByAggregateInputSchema';
import { RefreshTokenMinOrderByAggregateInputSchema } from './RefreshTokenMinOrderByAggregateInputSchema';

export const RefreshTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.RefreshTokenOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  jti: z.lazy(() => SortOrderSchema).optional(),
  familyId: z.lazy(() => SortOrderSchema).optional(),
  fingerprintHash: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  usedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RefreshTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RefreshTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RefreshTokenMinOrderByAggregateInputSchema).optional()
}).strict();

export default RefreshTokenOrderByWithAggregationInputSchema;
