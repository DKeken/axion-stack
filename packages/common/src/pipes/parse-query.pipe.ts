import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { z } from 'zod';

import { parseFilters } from '../dto/filtering.dto';
import { parseSortFields } from '../dto/sorting.dto';

/**
 * Parse and validate query parameters for pagination, filtering, sorting, and search
 */
@Injectable()
export class ParseQueryPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  /**
   * Extract filters from nested query parameters like filter[field][operator]=value
   */
  private extractFiltersFromQuery(
    query: Record<string, string | string[]>
  ): Record<string, Record<string, string | number | boolean | string[] | number[]>> | undefined {
    const filters: Record<
      string,
      Record<string, string | number | boolean | string[] | number[]>
    > = {};
    let hasFilters = false;

    for (const [key, value] of Object.entries(query)) {
      // Match filter[field][operator] pattern
      const match = key.match(/^filter\[([^\]]+)\]\[([^\]]+)\]$/);
      if (match) {
        const [, field, operator] = match;
        if (field && operator) {
          if (!filters[field]) {
            filters[field] = {};
          }
          filters[field][operator] = value;
          hasFilters = true;
        }
      }
    }

    return hasFilters ? filters : undefined;
  }

  transform(value: Record<string, string | string[]>): Record<string, unknown> {
    try {
      // Parse filters if present (handle both direct filter param and nested filter[field][op] format)
      const filterObj = this.extractFiltersFromQuery(value);
      if (filterObj || value.filter) {
        (value as Record<string, unknown>).filterConditions = parseFilters(
          typeof value.filter === 'string'
            ? value.filter
            : (filterObj as unknown as Record<string, string | number | boolean | string[]>),
          value // Pass all query params for field__op=value format
        );
      }

      // Parse sort fields if present
      if (value.sort) {
        const sortArray = Array.isArray(value.sort) ? value.sort : [value.sort];
        (value as Record<string, unknown>).sortFields = parseSortFields(sortArray);
      }

      // Validate with Zod schema
      const result = this.schema.safeParse(value);

      if (!result.success) {
        const errors = result.error.format();
        throw new BadRequestException({
          message: 'Invalid query parameters',
          errors,
        });
      }

      return result.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        message: 'Invalid query parameters',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

/**
 * Factory function to create ParseQueryPipe with specific schema
 */
export function createQueryPipe(schema: z.ZodSchema): ParseQueryPipe {
  return new ParseQueryPipe(schema);
}
