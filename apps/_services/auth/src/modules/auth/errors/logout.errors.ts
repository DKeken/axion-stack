import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class LogoutErrors extends AuthErrorBuilder {
  static unauthorized(message = 'Logout failed'): AuthErrorResponse {
    return LogoutErrors.createBaseError(
      401,
      '/api/v1/auth/logout',
      'POST',
      message,
      'Unauthorized'
    );
  }
}
