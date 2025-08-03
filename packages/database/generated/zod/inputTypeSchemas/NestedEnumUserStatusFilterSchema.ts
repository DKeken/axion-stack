import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';

export const NestedEnumUserStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusFilter> = z.object({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema),z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
}).strict();

export default NestedEnumUserStatusFilterSchema;
