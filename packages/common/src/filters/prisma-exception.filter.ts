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
 * Global Prisma exception filter for database-specific error handling
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let details: { field?: string; constraint?: string; table?: string; code?: string } = {};

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, details } = this.handleKnownRequestError(exception));
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      ({ status, message, details } = this.handleValidationError(exception));
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      details = {};
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: 'DatabaseError',
      details,
    };

    // Log error
    this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception.stack);

    response.status(status).json(errorResponse);
  }

  private handleKnownRequestError(exception: Prisma.PrismaClientKnownRequestError): {
    status: HttpStatus;
    message: string;
    details: { field?: string; constraint?: string; table?: string; code?: string };
  } {
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this data already exists',
          details: {
            field: Array.isArray(exception.meta?.target)
              ? (exception.meta?.target[0] as string)
              : (exception.meta?.target as string),
            constraint: 'unique',
          },
        };

      case 'P2025': // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          details: {
            constraint: String(exception.meta?.cause ?? 'foreign_key'),
          },
        };

      case 'P2003': // Foreign key constraint failed
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related record',
          details: {
            field: String(exception.meta?.field_name ?? 'field'),
          },
        };

      case 'P2014': // Required relation violates constraint
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation data',
          details: {
            table: String(exception.meta?.relation_name ?? 'relation'),
          },
        };

      case 'P2000': // Value out of range
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Value out of range for database field',
          details: {
            field:
              typeof exception.meta?.column_name === 'string'
                ? exception.meta.column_name
                : undefined,
          },
        };

      case 'P2006': // Invalid value
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid value provided',
          details: {
            field: String(exception.meta?.field_name ?? 'field'),
          },
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          details: {
            code: exception.code,
          },
        };
    }
  }

  private handleValidationError(exception: Prisma.PrismaClientValidationError): {
    status: HttpStatus;
    message: string;
    details: { field?: string; constraint?: string; table?: string; code?: string };
  } {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided to database',
      details: {
        constraint: exception.message.substring(0, 100),
      },
    };
  }
}
