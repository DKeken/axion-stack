import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class ProfileErrors {
  static unauthorized(message = 'Profile access denied'): AuthErrorResponse {
    return AuthErrorBuilder.createBaseError(
      401,
      '/api/v1/auth/profile',
      'GET',
      message,
      'Unauthorized'
    );
  }
}
