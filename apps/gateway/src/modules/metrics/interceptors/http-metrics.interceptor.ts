import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { MetricsService } from '../metrics.service';

import type { Request, Response } from 'express';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Skip metrics endpoint to avoid recursion
    if (request.path === '/metrics') {
      return next.handle();
    }

    const startTime = Date.now();

    // Increment active connections
    this.metricsService.incrementActiveConnections();

    // Extract service name from path
    const serviceName = this.extractServiceName(request.path);

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(request, response, startTime, serviceName);
        },
        error: (error) => {
          // Record error metrics
          const statusCode = error.status || 500;
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordHttpRequest(
            request.method,
            request.path,
            statusCode,
            duration,
            serviceName
          );
        },
        finalize: () => {
          // Always decrement active connections on completion
          this.metricsService.decrementActiveConnections();
        },
      })
    );
  }

  private recordMetrics(
    request: Request,
    response: Response,
    startTime: number,
    serviceName?: string
  ) {
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.recordHttpRequest(
      request.method,
      request.path,
      response.statusCode,
      duration,
      serviceName
    );
  }

  private extractServiceName(path: string): string | undefined {
    // Extract service name from API paths like /api/v1/auth/login -> auth
    const match = path.match(/^\/api\/v\d+\/([^/]+)/);
    return match ? match[1] : undefined;
  }
}
