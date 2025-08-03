import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','email','passwordHash','name','createdAt','updatedAt']);

export default UserScalarFieldEnumSchema;
