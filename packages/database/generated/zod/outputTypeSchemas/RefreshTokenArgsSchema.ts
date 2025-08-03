import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenSelectSchema } from '../inputTypeSchemas/RefreshTokenSelectSchema';
import { RefreshTokenIncludeSchema } from '../inputTypeSchemas/RefreshTokenIncludeSchema';

export const RefreshTokenArgsSchema: z.ZodType<Prisma.RefreshTokenDefaultArgs> = z.object({
  select: z.lazy(() => RefreshTokenSelectSchema).optional(),
  include: z.lazy(() => RefreshTokenIncludeSchema).optional(),
}).strict();

export default RefreshTokenArgsSchema;
