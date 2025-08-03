import { z } from 'zod';

export const PostScalarFieldEnumSchema = z.enum(['id','title','content','published','authorId','status','createdAt','updatedAt']);

export default PostScalarFieldEnumSchema;
