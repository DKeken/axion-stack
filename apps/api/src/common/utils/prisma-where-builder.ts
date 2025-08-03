import type { FilterCondition } from '../dto/filtering.dto';
import type { Prisma } from '@repo/database';

/**
 * Build Prisma where condition from filter conditions
 */
export function buildPrismaWhere(
  conditions: FilterCondition[]
): Record<
  string,
  Prisma.StringFilter | Prisma.DateTimeFilter | Prisma.BoolFilter | string | number | boolean
> {
  if (conditions.length === 0) {
    return {};
  }

  const where: Record<
    string,
    Prisma.StringFilter | Prisma.DateTimeFilter | Prisma.BoolFilter | string | number | boolean
  > = {};

  // Group conditions by field
  const fieldConditions = new Map<string, FilterCondition[]>();

  for (const condition of conditions) {
    const existing = fieldConditions.get(condition.field) ?? [];
    existing.push(condition);
    fieldConditions.set(condition.field, existing);
  }

  for (const [field, fieldConds] of fieldConditions.entries()) {
    const fieldWhere = buildFieldWhere(field, fieldConds);

    if (Object.keys(fieldWhere).length > 0) {
      // Handle nested fields (e.g., "user.name")
      const fields = field.split('.');

      if (fields.length === 1) {
        // Merge conditions for the same field
        if (where[field]) {
          where[field] = {
            ...((where[field] as Record<string, unknown>) || {}),
            ...(fieldWhere as Record<string, unknown>),
          };
        } else {
          where[field] = fieldWhere;
        }
      } else {
        // Build nested object for relations
        let nestedWhere: Record<string, unknown> = fieldWhere;

        for (let i = fields.length - 2; i >= 0; i--) {
          const field = fields[i];
          if (!field) throw new Error('Invalid nested field');
          nestedWhere = { [field]: nestedWhere };
        }

        // Merge with existing nested conditions
        Object.assign(where, nestedWhere);
      }
    }
  }

  return where;
}

function buildFieldWhere(field: string, conditions: FilterCondition[]): Record<string, unknown> {
  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    const condition = conditions[0];
    if (!condition) throw new Error('Invalid condition');
    return buildSingleCondition(condition);
  }

  // Multiple conditions for the same field - combine with AND
  const conditionObjects = conditions.map(buildSingleCondition);

  // If all conditions can be merged into a single object, do so
  if (canMergeConditions(conditionObjects)) {
    return conditionObjects.reduce((acc, cond) => ({ ...acc, ...cond }), {});
  }

  // Otherwise, use AND
  return { AND: conditionObjects };
}

function buildSingleCondition(condition: FilterCondition): Record<string, unknown> {
  const { operator, value } = condition;

  switch (operator) {
    case 'eq':
      return { equals: value };

    case 'ne':
      return { not: value };

    case 'in':
      return { in: Array.isArray(value) ? value : [value] };

    case 'nin':
      return { notIn: Array.isArray(value) ? value : [value] };

    case 'lt':
      return { lt: value };

    case 'lte':
      return { lte: value };

    case 'gt':
      return { gt: value };

    case 'gte':
      return { gte: value };

    case 'contains':
      return { contains: value, mode: 'insensitive' };

    case 'startsWith':
      return { startsWith: value, mode: 'insensitive' };

    case 'endsWith':
      return { endsWith: value, mode: 'insensitive' };

    default:
      throw new Error(`Unsupported filter operator: ${operator}`);
  }
}

function canMergeConditions(conditions: Record<string, unknown>[]): boolean {
  const keys = new Set<string>();

  for (const condition of conditions) {
    for (const key of Object.keys(condition)) {
      if (keys.has(key)) {
        return false; // Conflicting keys
      }
      keys.add(key);
    }
  }

  return true;
}

/**
 * Combine multiple where conditions with AND
 */
export function combineWhereConditions(
  ...conditions: (Record<string, unknown> | undefined)[]
): Record<string, unknown> {
  const validConditions = conditions.filter(
    (condition): condition is Record<string, unknown> =>
      condition !== undefined && Object.keys(condition).length > 0
  );

  if (validConditions.length === 0) {
    return {};
  }

  if (validConditions.length === 1) {
    const condition = validConditions[0];
    if (!condition) throw new Error('Invalid condition found');
    return condition;
  }

  return validConditions.length === 1 ? validConditions[0] : { AND: validConditions };
}
