import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostIncludeSchema } from '../inputTypeSchemas/PostIncludeSchema'
import { PostWhereInputSchema } from '../inputTypeSchemas/PostWhereInputSchema'
import { PostOrderByWithRelationInputSchema } from '../inputTypeSchemas/PostOrderByWithRelationInputSchema'
import { PostWhereUniqueInputSchema } from '../inputTypeSchemas/PostWhereUniqueInputSchema'
import { PostScalarFieldEnumSchema } from '../inputTypeSchemas/PostScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PostSelectSchema: z.ZodType<Prisma.PostSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  content: z.boolean().optional(),
  published: z.boolean().optional(),
  authorId: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  author: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PostFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PostFindFirstOrThrowArgs> = z.object({
  select: PostSelectSchema.optional(),
  include: z.lazy(() => PostIncludeSchema).optional(),
  where: PostWhereInputSchema.optional(),
  orderBy: z.union([ PostOrderByWithRelationInputSchema.array(),PostOrderByWithRelationInputSchema ]).optional(),
  cursor: PostWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PostScalarFieldEnumSchema,PostScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default PostFindFirstOrThrowArgsSchema;
