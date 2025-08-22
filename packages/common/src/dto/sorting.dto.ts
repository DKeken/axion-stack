// Import schemas from contracts package
import type { SortOrder } from '@repo/contracts';

export interface SortField {
  field: string;
  order: SortOrder;
}

/**
 * Parse sort strings into structured sort fields
 */
export function parseSortFields(sort?: string[]): SortField[] {
  if (!sort || sort.length === 0) {
    return [{ field: 'createdAt', order: 'desc' }]; // Default sort
  }

  return sort.map((sortStr) => {
    const [field, order] = sortStr.split(':');
    if (!field) throw new Error(`Invalid sort string: ${sortStr}`);
    return {
      field,
      order: (order as SortOrder) ?? 'asc',
    };
  });
}

/**
 * Convert sort fields to Prisma orderBy format
 */
export function buildPrismaOrderBy(
  sortFields: SortField[]
): Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>>[] {
  return sortFields.map((sort) => {
    // Handle nested fields (e.g., "user.name")
    const fields = sort.field.split('.');

    if (fields.length === 1) {
      const field = fields[0];
      if (!field) throw new Error('Invalid field name');
      return { [field]: sort.order };
    }

    // Build nested object for relations
    const lastField = fields[fields.length - 1];
    if (!lastField) throw new Error('Invalid nested field');
    let orderBy: Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>> = {
      [lastField]: sort.order,
    };

    for (let i = fields.length - 2; i >= 0; i--) {
      const field = fields[i];
      if (!field) throw new Error('Invalid nested field');
      orderBy = { [field]: orderBy } as Record<
        string,
        'asc' | 'desc' | Record<string, 'asc' | 'desc'>
      >;
    }

    return orderBy;
  });
}
