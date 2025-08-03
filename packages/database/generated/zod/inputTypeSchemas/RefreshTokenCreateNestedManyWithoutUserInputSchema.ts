import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { RefreshTokenCreateWithoutUserInputSchema } from './RefreshTokenCreateWithoutUserInputSchema';
import { RefreshTokenUncheckedCreateWithoutUserInputSchema } from './RefreshTokenUncheckedCreateWithoutUserInputSchema';
import { RefreshTokenCreateOrConnectWithoutUserInputSchema } from './RefreshTokenCreateOrConnectWithoutUserInputSchema';
import { RefreshTokenCreateManyUserInputEnvelopeSchema } from './RefreshTokenCreateManyUserInputEnvelopeSchema';
import { RefreshTokenWhereUniqueInputSchema } from './RefreshTokenWhereUniqueInputSchema';

export const RefreshTokenCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.RefreshTokenCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => RefreshTokenCreateWithoutUserInputSchema),z.lazy(() => RefreshTokenCreateWithoutUserInputSchema).array(),z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RefreshTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => RefreshTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RefreshTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RefreshTokenWhereUniqueInputSchema),z.lazy(() => RefreshTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RefreshTokenCreateNestedManyWithoutUserInputSchema;
