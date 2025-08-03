import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutRefreshTokensInputSchema } from './UserCreateNestedOneWithoutRefreshTokensInputSchema';

export const RefreshTokenCreateInputSchema: z.ZodType<Prisma.RefreshTokenCreateInput> = z.object({
  id: z.string().cuid().optional(),
  jti: z.string(),
  familyId: z.string(),
  fingerprintHash: z.string().optional().nullable(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().optional().nullable(),
  usedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutRefreshTokensInputSchema)
}).strict();

export default RefreshTokenCreateInputSchema;
