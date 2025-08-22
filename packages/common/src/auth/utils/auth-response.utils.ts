import type { Response } from 'express';

import { AuthCookieUtils } from '../../utils/auth-cookies';

/**
 * Utility for handling authentication responses in microservice architecture
 */
export class AuthResponseUtils {
  /**
   * Determine if cookies should be set for successful auth operations
   */
  static shouldSetAuthCookies(path: string, method: string, status?: number): boolean {
    if (status !== 200 && status !== 201) {
      return false;
    }

    return (
      (path === '/login' && method === 'POST') ||
      (path === '/register' && method === 'POST') ||
      (path === '/refresh' && method === 'POST')
    );
  }

  /**
   * Determine if cookies should be cleared on auth errors
   */
  static shouldClearAuthCookiesOnError(path: string, method: string, status?: number): boolean {
    if (status !== 401 && status !== 403) {
      return false;
    }

    return (path === '/refresh' && method === 'POST') || (path === '/profile' && method === 'GET');
  }

  /**
   * Handle authentication cookies for successful auth responses
   */
  static handleAuthCookies(data: unknown, res: Response): void {
    const refreshToken = AuthCookieUtils.extractRefreshToken(data);
    if (refreshToken) {
      AuthCookieUtils.setRefreshTokenCookie(res, refreshToken);
    }
  }

  /**
   * Handle logout cookies (clear refresh token)
   */
  static handleLogoutCookies(path: string, method: string, status: number, res: Response): void {
    if (path === '/logout' && method === 'POST' && (status === 200 || status === 401)) {
      AuthCookieUtils.clearRefreshTokenCookie(res);
    }
  }

  /**
   * Handle error cookies (clear on auth failures)
   */
  static handleErrorCookies(
    serviceName: string,
    path: string,
    method: string,
    status: number,
    res: Response
  ): void {
    if (
      serviceName === 'auth' &&
      AuthResponseUtils.shouldClearAuthCookiesOnError(path, method, status)
    ) {
      AuthCookieUtils.clearRefreshTokenCookie(res);
    }
  }
}
