import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

import type { Observable } from 'rxjs';

/**
 * Log all requests and responses for debugging and monitoring
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  private sanitizeUserAgent(userAgent: string): string {
    // Remove potential tokens or sensitive data from user-agent
    return userAgent
      .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
      .replace(/token\s*=\s*[^\s&]+/gi, 'token=[REDACTED]')
      .substring(0, 200); // Limit length
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const _userAgent = this.sanitizeUserAgent(headers['user-agent'] ?? '');
    const startTime = Date.now();

    // Log request (with sanitized data)
    this.logger.log(`📥 ${method} ${url} - ${ip}`);

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log(`📤 ${method} ${url} - ${statusCode} - ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status ?? 500;

          this.logger.error(
            `💥 ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`
          );
        },
      })
    );
  }
}
