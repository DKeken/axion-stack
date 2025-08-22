import { z } from 'zod';

// Recursive JSON schema for strictly typed JSON values
export const jsonSchema: z.ZodType<
  string | number | boolean | null | Record<string, unknown> | unknown[]
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema),
  ])
);

export const jsonRecordSchema = z.record(jsonSchema);
