import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export default NullableDateTimeFieldUpdateOperationsInputSchema;
