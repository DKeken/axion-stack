import { type z, ZodError } from 'zod';

import type { MicroserviceRequest, MicroserviceResponse } from '../types/microservices.types';
import type { AppRoute } from '@ts-rest/core';

export type MicroserviceRequestPayload = MicroserviceRequest;

/**
 * Utility for validating microservice requests against ts-rest contracts
 * Provides 100% type safety with proper Zod parsing
 */
export const TsRestValidationUtils = {
  /**
   * Validate request against ts-rest contract and return properly typed data
   */
  validateRequest<T extends AppRoute>(
    contract: T,
    payload: MicroserviceRequestPayload
  ):
    | {
        success: true;
        data: {
          body: T extends { body: z.ZodSchema } ? z.infer<T['body']> : undefined;
          query: T extends { query: z.ZodSchema } ? z.infer<T['query']> : undefined;
          pathParams: T extends { pathParams: z.ZodSchema } ? z.infer<T['pathParams']> : undefined;
          user?: { id?: string; sub?: string; email?: string; jti?: string; familyId?: string };
          method: string;
          path: string;
          headers: Record<string, string>;
        };
      }
    | { success: false; error: ZodError } {
    try {
      // Parse body if contract has a body schema
      let validatedBody: unknown = payload.body;
      if (
        'body' in contract &&
        contract.body &&
        typeof contract.body === 'object' &&
        'parse' in contract.body
      ) {
        validatedBody = (contract.body as z.ZodSchema).parse(payload.body);
      }

      // Parse query if contract has a query schema
      let validatedQuery: unknown = payload.query;
      if (
        'query' in contract &&
        contract.query &&
        typeof contract.query === 'object' &&
        'parse' in contract.query
      ) {
        validatedQuery = (contract.query as z.ZodSchema).parse(payload.query);
      }

      // Parse pathParams if contract has pathParams schema
      let validatedPathParams: unknown = payload.pathParams;
      if (
        'pathParams' in contract &&
        contract.pathParams &&
        typeof contract.pathParams === 'object' &&
        'parse' in contract.pathParams
      ) {
        validatedPathParams = (contract.pathParams as z.ZodSchema).parse(payload.pathParams);
      }

      return {
        success: true,
        data: {
          ...payload,
          body: validatedBody,
          query: validatedQuery,
          pathParams: validatedPathParams,
        } as {
          body: T extends { body: z.ZodSchema } ? z.infer<T['body']> : undefined;
          query: T extends { query: z.ZodSchema } ? z.infer<T['query']> : undefined;
          pathParams: T extends { pathParams: z.ZodSchema } ? z.infer<T['pathParams']> : undefined;
          user?: { id?: string; sub?: string; email?: string; jti?: string; familyId?: string };
          method: string;
          path: string;
          headers: Record<string, string>;
        },
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  },

  /**
   * Create a successful microservice response
   */
  createResponse<T>(status: number, data: T): MicroserviceResponse<T> {
    return { status, data };
  },

  /**
   * Create an error microservice response
   */
  createErrorResponse(status: number, message: string, error?: unknown): MicroserviceResponse {
    return {
      status,
      error: message,
      data: {
        message,
        details: error instanceof ZodError ? error.errors : String(error),
      },
    };
  },
};
