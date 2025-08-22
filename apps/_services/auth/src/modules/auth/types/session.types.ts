import type { SessionData } from '@repo/infrastructure';

/**
 * Auth session data for session management
 * Extends base SessionData with auth-specific fields
 */
export interface AuthSessionData extends SessionData {
  readonly refreshTokenId: string;
  readonly fingerprint: string;
  readonly deviceInfo: string | null;
  readonly isActive: boolean;
}

/**
 * Session creation options
 */
export interface SessionCreationOptions {
  readonly ttl?: number;
  readonly deviceInfo?: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  readonly isValid: boolean;
  readonly sessionData?: AuthSessionData;
  readonly reason?: string;
}

/**
 * Active session info for user management
 */
export interface ActiveSessionInfo {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly lastAccessedAt: string;
  readonly deviceInfo: string | null;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
  readonly fingerprint: string;
  readonly isActive: boolean;
}
