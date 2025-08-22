import { Controller, Res, UseGuards } from '@nestjs/common';
import { Public } from '@repo/common';
import { authContract } from '@repo/contracts';
import { ApiCacheService } from '@repo/infrastructure';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginErrors, LogoutErrors, RefreshErrors, RegisterErrors } from './errors';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

import type { RefreshTokenData } from './types/tokens.type';
import type { User } from '@repo/database';
import type { Response } from 'express';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiCacheService: ApiCacheService
  ) {}

  @Public()
  @TsRestHandler(authContract.register)
  async register(@Res({ passthrough: true }) response: Response) {
    return tsRestHandler(authContract.register, async ({ body }) => {
      try {
        const result = await this.authService.register(body);

        // Invalidate users cache after successful registration
        await this.apiCacheService.invalidateModule('users');

        // Set refresh token as httpOnly cookie
        this.setRefreshTokenCookie(response, result.tokens.refreshToken);

        return {
          status: 201 as const,
          body: result,
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('already exists')) {
            return {
              status: 409 as const,
              body: RegisterErrors.conflict(error.message),
            };
          }
        }

        return {
          status: 400 as const,
          body: RegisterErrors.badRequest(),
        };
      }
    });
  }

  @Public()
  @TsRestHandler(authContract.login)
  async login(@Res({ passthrough: true }) response: Response) {
    return tsRestHandler(authContract.login, async ({ body }) => {
      try {
        const result = await this.authService.login(body);

        // Set refresh token as httpOnly cookie
        this.setRefreshTokenCookie(response, result.tokens.refreshToken);

        return {
          status: 200 as const,
          body: result,
        };
      } catch (_error) {
        return {
          status: 401 as const,
          body: LoginErrors.unauthorized(),
        };
      }
    });
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @TsRestHandler(authContract.refresh)
  async refresh(
    @CurrentUser() { refreshTokenData }: { refreshTokenData: RefreshTokenData },
    @Res({ passthrough: true }) response: Response
  ) {
    return tsRestHandler(authContract.refresh, async ({ body }) => {
      try {
        const tokens = await this.authService.refreshTokens(refreshTokenData, body.fingerprint);

        // Set new refresh token as httpOnly cookie
        this.setRefreshTokenCookie(response, tokens.refreshToken);

        return {
          status: 200 as const,
          body: tokens,
        };
      } catch (_error) {
        // Clear refresh token cookie on error
        this.clearRefreshTokenCookie(response);

        return {
          status: 401 as const,
          body: RefreshErrors.unauthorized(),
        };
      }
    });
  }

  @UseGuards(RefreshTokenGuard)
  @TsRestHandler(authContract.logout)
  async logout(
    @CurrentUser() { refreshTokenData }: { refreshTokenData: RefreshTokenData },
    @Res({ passthrough: true }) response: Response
  ) {
    return tsRestHandler(authContract.logout, async () => {
      try {
        await this.authService.logout(refreshTokenData);

        // Clear refresh token cookie
        this.clearRefreshTokenCookie(response);

        return {
          status: 200 as const,
          body: {
            message: 'Logged out successfully',
          },
        };
      } catch (_error) {
        return {
          status: 401 as const,
          body: LogoutErrors.unauthorized(),
        };
      }
    });
  }

  @TsRestHandler(authContract.profile)
  async profile(@CurrentUser() user: User) {
    return tsRestHandler(authContract.profile, async () => {
      return {
        status: 200 as const,
        body: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          status: user.status,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
          timezone: user.timezone,
          language: user.language,
          theme: user.theme,
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
          lastLoginIp: user.lastLoginIp,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    });
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  private clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}
