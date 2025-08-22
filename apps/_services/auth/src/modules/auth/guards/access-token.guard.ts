import { type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { AuthUserResponse } from '@repo/contracts';

@Injectable()
export class AccessTokenGuard extends AuthGuard('access-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Add logging to see what's happening
    const request = context.switchToHttp().getRequest();
    const _authHeader = request.headers.authorization;

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthUserResponse>(
    err: Error | null,
    user: AuthUserResponse | null,
    info: { message?: string; name?: string } | undefined,
    context: ExecutionContext,
    status?: number
  ): TUser {
    return super.handleRequest(err, user, info, context, status);
  }
}
