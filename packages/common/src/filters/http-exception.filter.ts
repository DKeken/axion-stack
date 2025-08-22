import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: { field?: string; constraint?: string; table?: string; code?: string };
}

/**
 * Global HTTP exception filter for consistent error responses
 */
@Catch(HttpException, SyntaxError)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | SyntaxError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('exception', exception);

    // Handle JSON syntax errors specifically
    if (exception instanceof SyntaxError) {
      const errorResponse: ErrorResponse = {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'JSON Parse error: Invalid JSON format',
        error: 'Bad Request',
      };

      this.logger.warn(
        `${request.method} ${request.url} - 400 - JSON Parse error: ${exception.message}`
      );
      response.status(400).json(errorResponse);
      return;
    }

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.extractMessage(exceptionResponse),
      error: exception.name,
    };

    // Add details for validation errors
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, string | string[]>;
      if (responseObj.errors || responseObj.details) {
        errorResponse.details = {
          field: typeof responseObj.errors === 'string' ? responseObj.errors : undefined,
          constraint: typeof responseObj.details === 'string' ? responseObj.details : undefined,
        };
      }
    }

    // Log error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${exception.message}`,
        exception.stack
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${exception.message}`);
    }

    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: string | object): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, string | string[]>;

      if (responseObj.message) {
        return responseObj.message;
      }

      if (responseObj.error) {
        return responseObj.error;
      }
    }

    return 'Internal server error';
  }
}
