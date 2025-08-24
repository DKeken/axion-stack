import {
  Injectable,
  Logger,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { PushgatewayService } from './pushgateway.service';

@Injectable()
export class MicroserviceMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MicroserviceMetricsInterceptor.name);

  constructor(private readonly pushgatewayService: PushgatewayService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const rpcContext = context.switchToRpc();
    const pattern = rpcContext.getContext()?.pattern || 'unknown';
    const operation = this.extractOperationName(pattern);

    const startTime = Date.now();

    // Increment active operations
    this.pushgatewayService.incrementActiveOperations(operation);

    return next.handle().pipe(
      tap(() => {
        // Success metrics
        const duration = (Date.now() - startTime) / 1000;
        this.pushgatewayService.recordOperation(operation, 'success', duration);
        this.pushgatewayService.decrementActiveOperations(operation);
      }),
      catchError((error) => {
        // Error metrics
        const duration = (Date.now() - startTime) / 1000;
        const errorType = this.getErrorType(error);

        this.pushgatewayService.recordOperation(operation, 'error', duration);
        this.pushgatewayService.recordError(operation, errorType);
        this.pushgatewayService.decrementActiveOperations(operation);

        return throwError(() => error);
      })
    );
  }

  private extractOperationName(pattern: string): string {
    if (typeof pattern === 'string') {
      // Extract operation from pattern like 'auth.login' -> 'login'
      const parts = pattern.split('.');
      return parts[parts.length - 1] || 'unknown';
    }
    return 'unknown';
  }

  private getErrorType(error: unknown): string {
    if (error && typeof error === 'object' && 'name' in error && typeof error.name === 'string') {
      return error.name;
    }
    if (error && typeof error === 'object' && 'constructor' in error && error.constructor) {
      const constructor = error.constructor as { name?: string };
      if (constructor.name) {
        return constructor.name;
      }
    }
    if (typeof error === 'string') {
      return 'string_error';
    }
    return 'unknown_error';
  }
}
