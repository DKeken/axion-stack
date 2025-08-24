import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

import type { Observable } from 'rxjs';

export interface Response<T> {
  data: T;
  timestamp: string;
  statusCode: number;
  path: string;
}

/**
 * Transform all responses to a consistent format
 * Skip transformation for ts-rest endpoints (they handle their own response structure)
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T> | T> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Skip transformation for ts-rest API endpoints (all /api/v1/ paths)
        if (request.url.startsWith('/api/v1/')) {
          return data;
        }

        // Skip transformation for metrics endpoint
        if (request.url === '/metrics') {
          return data;
        }

        // Skip transformation for health endpoints
        if (request.url.includes('/health')) {
          return data;
        }

        // Skip transformation for ts-rest responses with specific structure
        if (data && typeof data === 'object' && 'status' in data && 'body' in data) {
          return data;
        }
        // Apply standard transformation for non-ts-rest endpoints
        return {
          data,
          timestamp: new Date().toISOString(),
          statusCode: response.statusCode,
          path: request.url,
        };
      })
    );
  }
}
