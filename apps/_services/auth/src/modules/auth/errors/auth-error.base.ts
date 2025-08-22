export interface AuthErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
}

export class AuthErrorBuilder {
  static createBaseError(
    statusCode: number,
    path: string,
    method: string,
    message: string,
    error: string
  ): AuthErrorResponse {
    return {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      method,
      message,
      error,
    };
  }
}
