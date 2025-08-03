import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { RefreshTokenScalarWhereInputSchema } from './RefreshTokenScalarWhereInputSchema';
import { RefreshTokenUpdateManyMutationInputSchema } from './RefreshTokenUpdateManyMutationInputSchema';
import { RefreshTokenUncheckedUpdateManyWithoutUserInputSchema } from './RefreshTokenUncheckedUpdateManyWithoutUserInputSchema';

export const RefreshTokenUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => RefreshTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RefreshTokenUpdateManyMutationInputSchema),z.lazy(() => RefreshTokenUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default RefreshTokenUpdateManyWithWhereWithoutUserInputSchema;
