import { z } from 'zod';
import { UserStatusSchema } from '../inputTypeSchemas/UserStatusSchema'
import { UserWithRelationsSchema, UserPartialWithRelationsSchema, UserOptionalDefaultsWithRelationsSchema } from './UserSchema'
import type { UserWithRelations, UserPartialWithRelations, UserOptionalDefaultsWithRelations } from './UserSchema'

/////////////////////////////////////////
// POST SCHEMA
/////////////////////////////////////////

/**
 * Пример модели для демонстрации связей и фильтров
 */
export const PostSchema = z.object({
  status: UserStatusSchema,
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  content: z.string().nullish(),
  published: z.boolean(),
  authorId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Post = z.infer<typeof PostSchema>

/////////////////////////////////////////
// POST PARTIAL SCHEMA
/////////////////////////////////////////

export const PostPartialSchema = PostSchema.partial()

export type PostPartial = z.infer<typeof PostPartialSchema>

/////////////////////////////////////////
// POST OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const PostOptionalDefaultsSchema = PostSchema.merge(z.object({
  status: UserStatusSchema.optional(),
  id: z.string().cuid().optional(),
  published: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type PostOptionalDefaults = z.infer<typeof PostOptionalDefaultsSchema>

/////////////////////////////////////////
// POST RELATION SCHEMA
/////////////////////////////////////////

export type PostRelations = {
  author: UserWithRelations;
};

export type PostWithRelations = z.infer<typeof PostSchema> & PostRelations

export const PostWithRelationsSchema: z.ZodType<PostWithRelations> = PostSchema.merge(z.object({
  author: z.lazy(() => UserWithRelationsSchema),
}))

/////////////////////////////////////////
// POST OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type PostOptionalDefaultsRelations = {
  author: UserOptionalDefaultsWithRelations;
};

export type PostOptionalDefaultsWithRelations = z.infer<typeof PostOptionalDefaultsSchema> & PostOptionalDefaultsRelations

export const PostOptionalDefaultsWithRelationsSchema: z.ZodType<PostOptionalDefaultsWithRelations> = PostOptionalDefaultsSchema.merge(z.object({
  author: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// POST PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type PostPartialRelations = {
  author?: UserPartialWithRelations;
};

export type PostPartialWithRelations = z.infer<typeof PostPartialSchema> & PostPartialRelations

export const PostPartialWithRelationsSchema: z.ZodType<PostPartialWithRelations> = PostPartialSchema.merge(z.object({
  author: z.lazy(() => UserPartialWithRelationsSchema),
})).partial()

export type PostOptionalDefaultsWithPartialRelations = z.infer<typeof PostOptionalDefaultsSchema> & PostPartialRelations

export const PostOptionalDefaultsWithPartialRelationsSchema: z.ZodType<PostOptionalDefaultsWithPartialRelations> = PostOptionalDefaultsSchema.merge(z.object({
  author: z.lazy(() => UserPartialWithRelationsSchema),
}).partial())

export type PostWithPartialRelations = z.infer<typeof PostSchema> & PostPartialRelations

export const PostWithPartialRelationsSchema: z.ZodType<PostWithPartialRelations> = PostSchema.merge(z.object({
  author: z.lazy(() => UserPartialWithRelationsSchema),
}).partial())

export default PostSchema;
