import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().min(1).optional(),
});

export type SearchDto = z.infer<typeof searchSchema>;

export interface SearchConfig {
  fields: string[];
  mode?: 'default' | 'insensitive';
}

/**
 * Build Prisma where condition for text search across multiple fields
 */
export function buildSearchWhere(
  query: string | undefined,
  config: SearchConfig
): Record<string, unknown> | undefined {
  if (!query || query.trim() === '') {
    return undefined;
  }

  const searchTerm = query.trim();

  if (config.fields.length === 0) {
    return undefined;
  }

  if (config.fields.length === 1) {
    const field = config.fields[0];
    if (!field) throw new Error('Invalid field configuration');
    return {
      [field]: {
        contains: searchTerm,
        mode: config.mode ?? 'insensitive',
      },
    };
  }

  // Multiple fields - use OR condition
  return {
    OR: config.fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: config.mode ?? 'insensitive',
      },
    })),
  };
}
