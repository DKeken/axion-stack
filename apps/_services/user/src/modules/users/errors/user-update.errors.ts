import { UserErrorBuilder, type UserErrorResponse } from './user-error.base';

export class UserUpdateErrors extends UserErrorBuilder {
  static notFound(userId: string): UserErrorResponse {
    return UserUpdateErrors.createBaseError(
      404,
      `/api/v1/users/${userId}`,
      'PATCH',
      'User not found',
      'Not Found'
    );
  }

  static conflict(userId: string, message: string): UserErrorResponse {
    return UserUpdateErrors.createBaseError(
      409,
      `/api/v1/users/${userId}`,
      'PATCH',
      message,
      'Conflict'
    );
  }

  static badRequest(userId: string, message = 'Failed to update user'): UserErrorResponse {
    return UserUpdateErrors.createBaseError(
      400,
      `/api/v1/users/${userId}`,
      'PATCH',
      message,
      'Bad Request'
    );
  }
}
