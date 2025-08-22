import { AuthErrorBuilder, type AuthErrorResponse } from './auth-error.base';

export class LoginErrors extends AuthErrorBuilder {
  static unauthorized(message = 'Invalid credentials'): AuthErrorResponse {
    return LoginErrors.createBaseError(401, '/api/v1/auth/login', 'POST', message, 'Unauthorized');
  }

  static badRequest(message = 'Login failed'): AuthErrorResponse {
    return LoginErrors.createBaseError(400, '/api/v1/auth/login', 'POST', message, 'Bad Request');
  }
}
