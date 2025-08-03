import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const RefreshTokenIncludeSchema: z.ZodType<Prisma.RefreshTokenInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default RefreshTokenIncludeSchema;
