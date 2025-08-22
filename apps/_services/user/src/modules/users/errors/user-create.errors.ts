import { UserErrorBuilder, type UserErrorResponse } from './user-error.base';

export class UserCreateErrors extends UserErrorBuilder {
  static conflict(message: string): UserErrorResponse {
    return UserCreateErrors.createBaseError(409, '/api/v1/users', 'POST', message, 'Conflict');
  }

  static badRequest(message = 'Failed to create user'): UserErrorResponse {
    return UserCreateErrors.createBaseError(400, '/api/v1/users', 'POST', message, 'Bad Request');
  }
}
