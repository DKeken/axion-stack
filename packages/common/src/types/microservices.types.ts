/**
 * Common types for microservice communication
 */

import type { User, RefreshToken } from '@repo/database';

export interface MicroserviceUser
  extends Omit<User, 'passwordHash' | 'resetToken' | 'resetTokenExpiry' | 'verificationToken'> {
  refreshTokenData?: Pick<
    RefreshToken,
    | 'id'
    | 'userId'
    | 'jti'
    | 'familyId'
    | 'fingerprintHash'
    | 'expiresAt'
    | 'createdAt'
    | 'revokedAt'
    | 'usedAt'
  >;
}

export interface MicroserviceRequest {
  method: string;
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, string>;
  body?: unknown;
  user?: MicroserviceUser;
  /** Path parameters extracted from route (e.g., { id: "123" } from /users/:id) */
  pathParams?: Record<string, string>;
}

export interface MicroserviceResponse<T = unknown> {
  status: number;
  data?: T;
  error?: string;
}

export interface MicroserviceErrorResponse {
  status: number;
  error: string;
  details?: unknown;
}
