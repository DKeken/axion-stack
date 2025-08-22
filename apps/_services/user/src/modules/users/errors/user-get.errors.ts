import { UserErrorBuilder, type UserErrorResponse } from './user-error.base';

export class UserGetErrors extends UserErrorBuilder {
  static notFound(userId: string): UserErrorResponse {
    return UserGetErrors.createBaseError(
      404,
      `/api/v1/users/${userId}`,
      'GET',
      'User not found',
      'Not Found'
    );
  }

  static badRequest(userId: string, message = 'Failed to fetch user'): UserErrorResponse {
    return UserGetErrors.createBaseError(
      400,
      `/api/v1/users/${userId}`,
      'GET',
      message,
      'Bad Request'
    );
  }
}
