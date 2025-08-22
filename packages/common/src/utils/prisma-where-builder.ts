import type { FilterCondition } from '../dto/filtering.dto';

/**
 * Build Prisma where condition from filter conditions
 */
export function buildPrismaWhere(conditions: FilterCondition[]): Record<string, unknown> {
  if (conditions.length === 0) {
    return {};
  }

  const where: Record<string, unknown> = {};

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
            ...fieldWhere,
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
  const { field, operator, value } = condition;

  // Convert string boolean values to actual booleans and normalize enum values
  let normalizedValue = normalizeBooleanValue(value);
  normalizedValue = normalizeEnumValue(field, normalizedValue);

  switch (operator) {
    case 'eq':
      return { equals: normalizedValue };

    case 'ne':
      return { not: normalizedValue };

    case 'in':
      return { in: Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue] };

    case 'nin':
      return { notIn: Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue] };

    case 'lt':
      return { lt: normalizedValue };

    case 'lte':
      return { lte: normalizedValue };

    case 'gt':
      return { gt: normalizedValue };

    case 'gte':
      return { gte: normalizedValue };

    case 'contains':
      // Handle array fields differently than string fields
      if (isArrayField(field)) {
        // For array fields, use 'has' for single values or 'hasSome' for arrays
        return Array.isArray(normalizedValue)
          ? { hasSome: normalizedValue }
          : { has: normalizedValue };
      }
      // For string fields, use contains with case insensitive mode
      return { contains: normalizedValue, mode: 'insensitive' };

    case 'startsWith':
      return { startsWith: normalizedValue, mode: 'insensitive' };

    case 'endsWith':
      return { endsWith: normalizedValue, mode: 'insensitive' };

    default:
      throw new Error(`Unsupported filter operator: ${operator}`);
  }
}

/**
 * Normalize string boolean values to actual booleans
 */
function normalizeBooleanValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeBooleanValue);
  }

  return value;
}

/**
 * Normalize enum values to correct case for specific fields
 */
function normalizeEnumValue(field: string, value: unknown): unknown {
  // Enum field mappings - add more as needed
  const enumMappings: Record<string, Record<string, string>> = {
    capabilities: {
      text: 'TEXT',
      vision: 'VISION',
      image: 'VISION', // Add alias for image -> VISION
      audio: 'AUDIO',
      multimodal: 'MULTIMODAL',
      code: 'CODE',
      function_calling: 'FUNCTION_CALLING',
      json_mode: 'JSON_MODE',
      streaming: 'STREAMING',
    },
    status: {
      active: 'ACTIVE',
      deprecated: 'DEPRECATED',
      maintenance: 'MAINTENANCE',
      discontinued: 'DISCONTINUED',
    },
  };

  if (enumMappings[field] && typeof value === 'string') {
    const mapping = enumMappings[field];
    const lowerValue = value.toLowerCase();
    return mapping[lowerValue] || value; // Return normalized value or original if not found
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeEnumValue(field, item));
  }

  return value;
}

/**
 * Check if a field is an array field that requires special handling
 */
function isArrayField(field: string): boolean {
  // List of fields that are arrays in the database
  const arrayFields = ['capabilities', 'tags', 'labels'];
  return arrayFields.includes(field);
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
