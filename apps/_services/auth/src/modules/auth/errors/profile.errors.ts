import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class ProfileErrors extends AuthErrorBuilder {
  static unauthorized(message = 'Profile access denied'): AuthErrorResponse {
    return ProfileErrors.createBaseError(
      401,
      '/api/v1/auth/profile',
      'GET',
      message,
      'Unauthorized'
    );
  }
}
