import { z } from 'zod';
import { RefreshTokenWithRelationsSchema, RefreshTokenPartialWithRelationsSchema, RefreshTokenOptionalDefaultsWithRelationsSchema } from './RefreshTokenSchema'
import type { RefreshTokenWithRelations, RefreshTokenPartialWithRelations, RefreshTokenOptionalDefaultsWithRelations } from './RefreshTokenSchema'
import { PostWithRelationsSchema, PostPartialWithRelationsSchema, PostOptionalDefaultsWithRelationsSchema } from './PostSchema'
import type { PostWithRelations, PostPartialWithRelations, PostOptionalDefaultsWithRelations } from './PostSchema'

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  name: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER PARTIAL SCHEMA
/////////////////////////////////////////

export const UserPartialSchema = UserSchema.partial()

export type UserPartial = z.infer<typeof UserPartialSchema>

/////////////////////////////////////////
// USER OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

/////////////////////////////////////////
// USER RELATION SCHEMA
/////////////////////////////////////////

export type UserRelations = {
  refreshTokens: RefreshTokenWithRelations[];
  posts: PostWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  refreshTokens: z.lazy(() => RefreshTokenWithRelationsSchema).array(),
  posts: z.lazy(() => PostWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type UserOptionalDefaultsRelations = {
  refreshTokens: RefreshTokenOptionalDefaultsWithRelations[];
  posts: PostOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  refreshTokens: z.lazy(() => RefreshTokenOptionalDefaultsWithRelationsSchema).array(),
  posts: z.lazy(() => PostOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type UserPartialRelations = {
  refreshTokens?: RefreshTokenPartialWithRelations[];
  posts?: PostPartialWithRelations[];
};

export type UserPartialWithRelations = z.infer<typeof UserPartialSchema> & UserPartialRelations

export const UserPartialWithRelationsSchema: z.ZodType<UserPartialWithRelations> = UserPartialSchema.merge(z.object({
  refreshTokens: z.lazy(() => RefreshTokenPartialWithRelationsSchema).array(),
  posts: z.lazy(() => PostPartialWithRelationsSchema).array(),
})).partial()

export type UserOptionalDefaultsWithPartialRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserPartialRelations

export const UserOptionalDefaultsWithPartialRelationsSchema: z.ZodType<UserOptionalDefaultsWithPartialRelations> = UserOptionalDefaultsSchema.merge(z.object({
  refreshTokens: z.lazy(() => RefreshTokenPartialWithRelationsSchema).array(),
  posts: z.lazy(() => PostPartialWithRelationsSchema).array(),
}).partial())

export type UserWithPartialRelations = z.infer<typeof UserSchema> & UserPartialRelations

export const UserWithPartialRelationsSchema: z.ZodType<UserWithPartialRelations> = UserSchema.merge(z.object({
  refreshTokens: z.lazy(() => RefreshTokenPartialWithRelationsSchema).array(),
  posts: z.lazy(() => PostPartialWithRelationsSchema).array(),
}).partial())

export default UserSchema;
