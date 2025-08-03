import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { parseFilters } from '../dto/filtering.dto';
import { parseSortFields } from '../dto/sorting.dto';

/**
 * Parse and validate query parameters for pagination, filtering, sorting, and search
 */
@Injectable()
export class ParseQueryPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: Record<string, string | string[]>): Record<string, unknown> {
    try {
      // Parse filters if present
      if (value.filter) {
        (value as Record<string, unknown>).filterConditions = parseFilters(
          typeof value.filter === 'string' ? value.filter : undefined
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
