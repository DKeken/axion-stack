import type { Response } from 'express';

/**
 * Utility functions for managing authentication cookies
 * Extracted from auth.controller.ts to be reused in gateway
 */

export interface RefreshTokenCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

export const AuthCookieUtils = {
  setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    options?: Partial<RefreshTokenCookieOptions>
  ): void {
    const defaultOptions: RefreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    const mergedOptions = { ...defaultOptions, ...options };

    response.cookie('refreshToken', refreshToken, mergedOptions);
  },

  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  /**
   * Check if response data contains tokens that require cookie handling
   */
  hasTokensForCookies(
    data: unknown
  ): data is { tokens: { refreshToken: string } } | { refreshToken: string } {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;

    // Check for nested tokens structure (login/register response)
    if (obj.tokens && typeof obj.tokens === 'object') {
      const tokens = obj.tokens as Record<string, unknown>;
      return typeof tokens.refreshToken === 'string';
    }

    // Check for direct refreshToken (refresh endpoint response)
    return typeof obj.refreshToken === 'string';
  },

  /**
   * Extract refresh token from response data
   */
  extractRefreshToken(data: unknown): string | null {
    if (!AuthCookieUtils.hasTokensForCookies(data)) {
      return null;
    }

    const obj = data as Record<string, unknown>;

    if (obj.tokens && typeof obj.tokens === 'object') {
      const tokens = obj.tokens as Record<string, unknown>;
      return tokens.refreshToken as string;
    }

    return obj.refreshToken as string;
  },
} as const;
