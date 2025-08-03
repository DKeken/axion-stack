import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => UserStatusSchema).optional()
}).strict();

export default EnumUserStatusFieldUpdateOperationsInputSchema;
