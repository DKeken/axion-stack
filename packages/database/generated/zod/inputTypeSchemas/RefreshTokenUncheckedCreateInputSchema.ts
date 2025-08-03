import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RefreshTokenUncheckedCreateInputSchema: z.ZodType<Prisma.RefreshTokenUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  jti: z.string(),
  familyId: z.string(),
  fingerprintHash: z.string().optional().nullable(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().optional().nullable(),
  usedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default RefreshTokenUncheckedCreateInputSchema;
