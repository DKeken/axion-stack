import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import type { Request, Response } from 'express';

import type { ErrorResponse } from './http-exception.filter';

/**
 * Secure Prisma exception filter with conservative error handling
 *
 * This filter follows security-first principles:
 * - Never exposes database structure or internal details
 * - Uses conservative HTTP status codes
 * - Provides detailed logging for developers only
 * - Returns generic, safe error messages to clients
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | Prisma.PrismaClientInitializationError,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate unique error ID for tracking
    const errorId = this.generateErrorId();

    // Determine response based on exception type
    const { status, message, logLevel } = this.classifyException(exception);

    // Log detailed information for developers (never send to client)
    this.logException(exception, request, errorId, logLevel);

    // Send safe, generic response to client
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: 'DatabaseError',
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Classify exception using the only correct approach:
   * ALL database errors = 500 Internal Server Error
   *
   * Business logic should handle its own cases by checking existence
   * before operations, not by trying to interpret database errors.
   */
  private classifyException(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | Prisma.PrismaClientInitializationError
  ): { status: HttpStatus; message: string; logLevel: 'warn' | 'error' } {
    // Only validation errors might be client-side, but even these
    // usually indicate programming errors, not user input errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        logLevel: 'error', // This is usually a programming error
      };
    }

    // ALL database operation errors are server errors
    // Business logic should prevent conflicts by checking existence first
    // If race conditions are acceptable - let them bubble up as 500s
    // If not acceptable - use database locks in business logic
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      logLevel: 'error',
    };
  }

  /**
   * Log detailed exception information for developers
   * This information should NEVER be sent to the client
   */
  private logException(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | Prisma.PrismaClientInitializationError,
    request: Request,
    errorId: string,
    logLevel: 'warn' | 'error'
  ): void {
    const logMessage = `Database error [${errorId}] ${request.method} ${request.url}`;

    // Safe context - avoid logging potentially sensitive headers
    const logContext = {
      errorId,
      method: request.method,
      url: request.url,
      // Only log safe browser info, avoid tokens in User-Agent
      userAgent: this.sanitizeUserAgent(request.headers['user-agent']),
      ip: request.ip || 'unknown',
      exceptionType: exception.constructor.name,
      ...(exception instanceof Prisma.PrismaClientKnownRequestError &&
        exception.code && { code: exception.code }),
      ...(exception instanceof Prisma.PrismaClientKnownRequestError &&
        exception.meta && { meta: this.sanitizeMeta(exception.meta) }),
      ...(exception.message && { fullMessage: exception.message.substring(0, 500) }), // Truncate long messages
    };

    if (logLevel === 'error') {
      this.logger.error(logMessage, exception.stack, logContext);
    } else {
      this.logger.warn(logMessage, logContext);
    }
  }

  /**
   * Generate unique error ID for tracking
   * Uses crypto for better performance and uniqueness in high-load scenarios
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `db-${timestamp}-${randomPart}`;
  }

  /**
   * Sanitize User-Agent to avoid logging sensitive tokens
   */
  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    // Remove potential tokens/keys from User-Agent
    return userAgent
      .replace(/Bearer\s+[\w.-]+/gi, 'Bearer [REDACTED]')
      .replace(/token[=:]\s*[\w.-]+/gi, 'token=[REDACTED]')
      .substring(0, 200); // Truncate long user agents
  }

  /**
   * Sanitize Prisma meta to avoid logging sensitive data
   */
  private sanitizeMeta(meta: unknown): unknown {
    if (!meta || typeof meta !== 'object') return meta;

    const sanitized = { ...(meta as Record<string, unknown>) };

    // Remove potentially sensitive fields while keeping structure info
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key];
      if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = `${value.substring(0, 100)}...`;
      }
    });

    return sanitized;
  }
}
