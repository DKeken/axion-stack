import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserIncludeSchema } from '../inputTypeSchemas/UserIncludeSchema'
import { UserUpdateInputSchema } from '../inputTypeSchemas/UserUpdateInputSchema'
import { UserUncheckedUpdateInputSchema } from '../inputTypeSchemas/UserUncheckedUpdateInputSchema'
import { UserWhereUniqueInputSchema } from '../inputTypeSchemas/UserWhereUniqueInputSchema'
import { RefreshTokenFindManyArgsSchema } from "../outputTypeSchemas/RefreshTokenFindManyArgsSchema"
import { PostFindManyArgsSchema } from "../outputTypeSchemas/PostFindManyArgsSchema"
import { UserCountOutputTypeArgsSchema } from "../outputTypeSchemas/UserCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  passwordHash: z.boolean().optional(),
  name: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  refreshTokens: z.union([z.boolean(),z.lazy(() => RefreshTokenFindManyArgsSchema)]).optional(),
  posts: z.union([z.boolean(),z.lazy(() => PostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export default UserUpdateArgsSchema;
