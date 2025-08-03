import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RefreshTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RefreshTokenOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RefreshTokenOrderByRelationAggregateInputSchema;
