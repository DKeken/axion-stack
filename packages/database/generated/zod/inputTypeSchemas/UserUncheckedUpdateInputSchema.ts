import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { RefreshTokenUncheckedUpdateManyWithoutUserNestedInputSchema } from './RefreshTokenUncheckedUpdateManyWithoutUserNestedInputSchema';
import { PostUncheckedUpdateManyWithoutAuthorNestedInputSchema } from './PostUncheckedUpdateManyWithoutAuthorNestedInputSchema';

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string().email(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  passwordHash: z.union([ z.string().min(8),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  refreshTokens: z.lazy(() => RefreshTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  posts: z.lazy(() => PostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export default UserUncheckedUpdateInputSchema;
