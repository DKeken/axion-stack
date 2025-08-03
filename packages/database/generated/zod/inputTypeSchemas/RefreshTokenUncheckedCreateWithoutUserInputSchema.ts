import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RefreshTokenUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  jti: z.string(),
  familyId: z.string(),
  fingerprintHash: z.string().optional().nullable(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().optional().nullable(),
  usedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default RefreshTokenUncheckedCreateWithoutUserInputSchema;
