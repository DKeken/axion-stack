import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class RegisterErrors extends AuthErrorBuilder {
  static conflict(message: string): AuthErrorResponse {
    return RegisterErrors.createBaseError(
      409,
      '/api/v1/auth/register',
      'POST',
      message,
      'Conflict'
    );
  }

  static badRequest(message = 'Registration failed'): AuthErrorResponse {
    return RegisterErrors.createBaseError(
      400,
      '/api/v1/auth/register',
      'POST',
      message,
      'Bad Request'
    );
  }
}
