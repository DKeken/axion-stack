import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class RegisterErrors {
  static conflict(message: string): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      409,
      '/api/v1/auth/register',
      'POST',
      message,
      'Conflict'
    );
  }

  static badRequest(message = 'Registration failed'): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      400,
      '/api/v1/auth/register',
      'POST',
      message,
      'Bad Request'
    );
  }
}
