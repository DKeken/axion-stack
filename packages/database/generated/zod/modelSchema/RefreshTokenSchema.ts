import { z } from 'zod';
import { UserWithRelationsSchema, UserPartialWithRelationsSchema, UserOptionalDefaultsWithRelationsSchema } from './UserSchema'
import type { UserWithRelations, UserPartialWithRelations, UserOptionalDefaultsWithRelations } from './UserSchema'

/////////////////////////////////////////
// REFRESH TOKEN SCHEMA
/////////////////////////////////////////

export const RefreshTokenSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  /**
   * JWT ID для уникальной идентификации токена
   */
  jti: z.string(),
  /**
   * Идентификатор семейства токенов для reuse-детекции
   */
  familyId: z.string(),
  /**
   * Хэш устройства/браузера для дополнительной безопасности
   */
  fingerprintHash: z.string().nullish(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullish(),
  /**
   * Когда токен был использован для refresh
   */
  usedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
})

export type RefreshToken = z.infer<typeof RefreshTokenSchema>

/////////////////////////////////////////
// REFRESH TOKEN PARTIAL SCHEMA
/////////////////////////////////////////

export const RefreshTokenPartialSchema = RefreshTokenSchema.partial()

export type RefreshTokenPartial = z.infer<typeof RefreshTokenPartialSchema>

/////////////////////////////////////////
// REFRESH TOKEN OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const RefreshTokenOptionalDefaultsSchema = RefreshTokenSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
}))

export type RefreshTokenOptionalDefaults = z.infer<typeof RefreshTokenOptionalDefaultsSchema>

/////////////////////////////////////////
// REFRESH TOKEN RELATION SCHEMA
/////////////////////////////////////////

export type RefreshTokenRelations = {
  user: UserWithRelations;
};

export type RefreshTokenWithRelations = z.infer<typeof RefreshTokenSchema> & RefreshTokenRelations

export const RefreshTokenWithRelationsSchema: z.ZodType<RefreshTokenWithRelations> = RefreshTokenSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

/////////////////////////////////////////
// REFRESH TOKEN OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type RefreshTokenOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
};

export type RefreshTokenOptionalDefaultsWithRelations = z.infer<typeof RefreshTokenOptionalDefaultsSchema> & RefreshTokenOptionalDefaultsRelations

export const RefreshTokenOptionalDefaultsWithRelationsSchema: z.ZodType<RefreshTokenOptionalDefaultsWithRelations> = RefreshTokenOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// REFRESH TOKEN PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type RefreshTokenPartialRelations = {
  user?: UserPartialWithRelations;
};

export type RefreshTokenPartialWithRelations = z.infer<typeof RefreshTokenPartialSchema> & RefreshTokenPartialRelations

export const RefreshTokenPartialWithRelationsSchema: z.ZodType<RefreshTokenPartialWithRelations> = RefreshTokenPartialSchema.merge(z.object({
  user: z.lazy(() => UserPartialWithRelationsSchema),
})).partial()

export type RefreshTokenOptionalDefaultsWithPartialRelations = z.infer<typeof RefreshTokenOptionalDefaultsSchema> & RefreshTokenPartialRelations

export const RefreshTokenOptionalDefaultsWithPartialRelationsSchema: z.ZodType<RefreshTokenOptionalDefaultsWithPartialRelations> = RefreshTokenOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserPartialWithRelationsSchema),
}).partial())

export type RefreshTokenWithPartialRelations = z.infer<typeof RefreshTokenSchema> & RefreshTokenPartialRelations

export const RefreshTokenWithPartialRelationsSchema: z.ZodType<RefreshTokenWithPartialRelations> = RefreshTokenSchema.merge(z.object({
  user: z.lazy(() => UserPartialWithRelationsSchema),
}).partial())

export default RefreshTokenSchema;
