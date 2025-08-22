import { z } from 'zod';

export const filterOperatorSchema = z.enum([
  'eq', // equals
  'ne', // not equals
  'in', // in array
  'nin', // not in array
  'lt', // less than
  'lte', // less than or equal
  'gt', // greater than
  'gte', // greater than or equal
  'contains', // string contains
  'startsWith', // string starts with
  'endsWith', // string ends with
  'mode', // case sensitivity mode
]);

export type FilterOperator = z.infer<typeof filterOperatorSchema>;

export const filteringSchema = z
  .object({
    filter: z
      .union([
        z.string(), // JSON string
        z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])), // Filter values
      ])
      .optional(),
  })
  .passthrough(); // Allow additional properties to pass through

export type FilteringDto = z.infer<typeof filteringSchema>;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | number[];
}

/**
 * Parse filter parameter (either JSON string or query params like "field__op=value")
 */
export function parseFilters(
  filter?: string | Record<string, string | number | boolean | string[] | number[]>,
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
