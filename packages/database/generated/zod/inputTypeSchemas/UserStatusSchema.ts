import { z } from 'zod';

export const UserStatusSchema = z.enum(['ACTIVE','INACTIVE','PENDING','SUSPENDED']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

export default UserStatusSchema;
