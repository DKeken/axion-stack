export interface UserErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class UserErrorBuilder {
  protected static createBaseError(
    statusCode: number,
    path: string,
    method: string,
    message: string,
    error: string
  ): UserErrorResponse {
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
