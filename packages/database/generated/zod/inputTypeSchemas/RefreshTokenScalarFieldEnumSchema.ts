import { z } from 'zod';

export const RefreshTokenScalarFieldEnumSchema = z.enum(['id','userId','jti','familyId','fingerprintHash','expiresAt','revokedAt','usedAt','createdAt']);

export default RefreshTokenScalarFieldEnumSchema;
