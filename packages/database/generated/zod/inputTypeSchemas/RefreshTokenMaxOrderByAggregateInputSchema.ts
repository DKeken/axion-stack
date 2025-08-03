import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RefreshTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RefreshTokenMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  jti: z.lazy(() => SortOrderSchema).optional(),
  familyId: z.lazy(() => SortOrderSchema).optional(),
  fingerprintHash: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RefreshTokenMaxOrderByAggregateInputSchema;
