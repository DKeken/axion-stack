import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class LogoutErrors {
  static unauthorized(message = 'Logout failed'): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      401,
      '/api/v1/auth/logout',
      'POST',
      message,
      'Unauthorized'
    );
  }
}
