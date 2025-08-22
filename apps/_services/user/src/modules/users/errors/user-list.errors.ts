import { UserErrorBuilder, type UserErrorResponse } from './user-error.base';

export class UserListErrors extends UserErrorBuilder {
  static badRequest(message = 'Failed to fetch users'): UserErrorResponse {
    return UserListErrors.createBaseError(400, '/api/v1/users', 'GET', message, 'Bad Request');
  }
}
