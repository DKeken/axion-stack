import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    sub?: string;
    jti?: string;
    familyId?: string;
  };
}

export const CurrentUser = createParamDecorator(
  (_data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  }
);
