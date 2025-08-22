import type { PaginationResponse } from '../dto/pagination.dto';

/**
 * Generate cursor from item (by default uses createdAt + id)
 */
export function generateCursor(item: { createdAt: Date | string; id: string }): string {
  const createdAt = item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt;
  return Buffer.from(`${createdAt}:${item.id}`).toString('base64');
}

/**
 * Parse cursor to get createdAt and id
 */
export function parseCursor(cursor: string): { createdAt: string; id: string } {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [createdAt, id] = decoded.split(':');

    if (!createdAt || !id) {
      throw new Error('Invalid cursor format');
    }

    return { createdAt, id };
  } catch {
    throw new Error('Invalid cursor format');
  }
}

/**
 * Build cursor where condition for pagination
 */
export function buildCursorWhere(cursor: string): {
  OR: ({ createdAt: { lt: Date } } | { AND: { createdAt: Date; id: { lt: string } }[] })[];
} {
  const { createdAt, id } = parseCursor(cursor);

  return {
    OR: [
      { createdAt: { lt: new Date(createdAt) } },
      {
        AND: [{ createdAt: new Date(createdAt), id: { lt: id } }],
      },
    ],
  };
}

/**
 * Create pagination response
 */
export function createPaginationResponse<T extends { createdAt: Date | string; id: string }>(
  items: T[],
  limit: number,
  total?: number
): PaginationResponse<T> {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0 ? generateCursor(items[items.length - 1]) : null;

  return {
    items,
    nextCursor,
    hasMore,
    total,
  };
}
