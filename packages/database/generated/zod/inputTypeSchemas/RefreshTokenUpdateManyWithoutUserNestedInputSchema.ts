import type { Prisma } from '../../../node_modules/.prisma/client';

import { z } from 'zod';
import { RefreshTokenCreateWithoutUserInputSchema } from './RefreshTokenCreateWithoutUserInputSchema';
import { RefreshTokenUncheckedCreateWithoutUserInputSchema } from './RefreshTokenUncheckedCreateWithoutUserInputSchema';
import { RefreshTokenCreateOrConnectWithoutUserInputSchema } from './RefreshTokenCreateOrConnectWithoutUserInputSchema';
import { RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema } from './RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema';
import { RefreshTokenCreateManyUserInputEnvelopeSchema } from './RefreshTokenCreateManyUserInputEnvelopeSchema';
import { RefreshTokenWhereUniqueInputSchema } from './RefreshTokenWhereUniqueInputSchema';
import { RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema } from './RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema';
import { RefreshTokenUpdateManyWithWhereWithoutUserInputSchema } from './RefreshTokenUpdateManyWithWhereWithoutUserInputSchema';
import { RefreshTokenScalarWhereInputSchema } from './RefreshTokenScalarWhereInputSchema';

export const RefreshTokenUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.RefreshTokenUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => RefreshTokenCreateWithoutUserInputSchema),z.lazy(() => RefreshTokenCreateWithoutUserInputSchema).array(),z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => RefreshTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RefreshTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => RefreshTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => RefreshTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RefreshTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RefreshTokenWhereUniqueInputSchema),z.lazy(() => RefreshTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RefreshTokenWhereUniqueInputSchema),z.lazy(() => RefreshTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RefreshTokenWhereUniqueInputSchema),z.lazy(() => RefreshTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RefreshTokenWhereUniqueInputSchema),z.lazy(() => RefreshTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => RefreshTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RefreshTokenUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => RefreshTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RefreshTokenScalarWhereInputSchema),z.lazy(() => RefreshTokenScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RefreshTokenUpdateManyWithoutUserNestedInputSchema;
