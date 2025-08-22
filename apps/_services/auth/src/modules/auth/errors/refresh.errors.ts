import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class RefreshErrors {
  static unauthorized(message = 'Invalid or expired refresh token'): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      401,
      '/api/v1/auth/refresh',
      'POST',
      message,
      'Unauthorized'
    );
  }

  static forbidden(message = 'Refresh token forbidden'): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      403,
      '/api/v1/auth/refresh',
      'POST',
      message,
      'Forbidden'
    );
  }
}
