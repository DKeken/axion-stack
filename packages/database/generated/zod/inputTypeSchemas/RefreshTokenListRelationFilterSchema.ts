import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { RefreshTokenWhereInputSchema } from './RefreshTokenWhereInputSchema';

export const RefreshTokenListRelationFilterSchema: z.ZodType<Prisma.RefreshTokenListRelationFilter> = z.object({
  every: z.lazy(() => RefreshTokenWhereInputSchema).optional(),
  some: z.lazy(() => RefreshTokenWhereInputSchema).optional(),
  none: z.lazy(() => RefreshTokenWhereInputSchema).optional()
}).strict();

export default RefreshTokenListRelationFilterSchema;
