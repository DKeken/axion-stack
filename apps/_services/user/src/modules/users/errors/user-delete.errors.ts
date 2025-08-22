import { UserErrorBuilder, type UserErrorResponse } from './user-error.base';

export class UserDeleteErrors extends UserErrorBuilder {
  static notFound(userId: string): UserErrorResponse {
    return UserDeleteErrors.createBaseError(
      404,
      `/api/v1/users/${userId}`,
      'DELETE',
      'User not found',
      'Not Found'
    );
  }

  static badRequest(userId: string, message = 'Failed to delete user'): UserErrorResponse {
    return UserDeleteErrors.createBaseError(
      400,
      `/api/v1/users/${userId}`,
      'DELETE',
      message,
      'Bad Request'
    );
  }
}
