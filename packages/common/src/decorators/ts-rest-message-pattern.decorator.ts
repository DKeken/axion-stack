import { SetMetadata } from '@nestjs/common';

import type { AppRoute } from '@ts-rest/core';

/**
 * Metadata key for ts-rest message pattern integration
 */
export const TS_REST_MESSAGE_PATTERN = 'TS_REST_MESSAGE_PATTERN';

/**
 * Decorator that integrates ts-rest contracts with NestJS MessagePattern
 * Provides automatic validation and type safety for microservice handlers
 *
 * @param pattern - MessagePattern string (e.g., 'auth.login')
 * @param contract - ts-rest contract route for validation and typing
 *
 * @example
 * ```typescript
 * @TsRestMessagePattern('auth.login', authContract.login)
 * async login(@Payload() request: MicroserviceRequest) {
 *   // Automatic validation of request.body against authContract.login.body schema
 *   // Type-safe access to validated data
 * }
 * ```
 */
export function TsRestMessagePattern(pattern: string, contract: AppRoute) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    // Set MessagePattern metadata
    SetMetadata('microservices:pattern', pattern)(target, propertyKey, descriptor);
    SetMetadata('microservices:handler_type', 'MESSAGE_PATTERN')(target, propertyKey, descriptor);
    SetMetadata('microservices:transport', 'RMQ')(target, propertyKey, descriptor);

    // Set ts-rest contract metadata
    SetMetadata(TS_REST_MESSAGE_PATTERN, {
      pattern,
      contract,
      method: contract.method,
      path: contract.path,
      bodySchema: 'body' in contract ? contract.body : undefined,
      querySchema: 'query' in contract ? contract.query : undefined,
      pathParamsSchema: 'pathParams' in contract ? contract.pathParams : undefined,
      responseSchemas: contract.responses,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * Type helper to extract request type from ts-rest contract
 */
export interface TsRestMessageRequest<T extends AppRoute> {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: T extends { body: infer B } ? B : undefined;
  pathParams: T extends { pathParams: infer P } ? P : undefined;
  user?: {
    id: string;
    email: string;
    sub?: string;
  };
}

/**
 * Type helper to extract response type from ts-rest contract
 */
export interface TsRestMessageResponse<T extends AppRoute> {
  status: keyof T['responses'];
  data: T['responses'][keyof T['responses']];
}
