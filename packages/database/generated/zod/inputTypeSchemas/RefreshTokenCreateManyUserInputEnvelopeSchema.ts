import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { RefreshTokenCreateManyUserInputSchema } from './RefreshTokenCreateManyUserInputSchema';

export const RefreshTokenCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.RefreshTokenCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RefreshTokenCreateManyUserInputSchema),z.lazy(() => RefreshTokenCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RefreshTokenCreateManyUserInputEnvelopeSchema;
