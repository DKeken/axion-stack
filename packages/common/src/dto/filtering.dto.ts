// Import schemas from contracts package
import { type FilterOperator, filterOperatorSchema } from '@repo/contracts';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | number[];
}

/**
 * Parse filter parameter (either JSON string or query params like "field__op=value")
 */
export function parseFilters(
  filter?: string | Record<string, string | number | boolean | string[]>,
  queryParams?: Record<string, string | string[]>
): FilterCondition[] {
  const conditions: FilterCondition[] = [];

  // Parse JSON filter
  if (filter) {
    try {
      const filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;

      for (const [field, value] of Object.entries(
        filterObj as Record<string, string | number | boolean>
      )) {
        if (typeof value === 'object' && value !== null) {
          // Handle complex conditions like { name: { contains: "john" } }
          for (const [operator, operatorValue] of Object.entries(
            value as Record<string, string | number | boolean>
          )) {
            if (filterOperatorSchema.safeParse(operator).success) {
              conditions.push({
                field,
                operator: operator as FilterOperator,
                value: operatorValue,
              });
            }
          }
        } else {
          // Simple equality condition
          conditions.push({
            field,
            operator: 'eq',
            value,
          });
        }
      }
    } catch (error) {
      throw new Error(
        `Invalid filter JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Parse query params format like "name__contains=john"
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (key.includes('__')) {
        const [field, operator] = key.split('__');
        if (field && operator && filterOperatorSchema.safeParse(operator).success) {
          conditions.push({
            field,
            operator: operator as FilterOperator,
            value,
          });
        }
      }
    }
  }

  return conditions;
}
