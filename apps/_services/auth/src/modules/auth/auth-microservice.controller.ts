import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';

import type { MicroserviceRequest, MicroserviceResponse } from '@repo/common/types';
import type { LoginDto, RefreshTokenDto, RegisterDto } from '@repo/contracts';

@Controller()
export class AuthMicroserviceController {
  private readonly logger = new Logger(AuthMicroserviceController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing auth.register request');

      const registerDto = request.body as RegisterDto;
      // Add fingerprint from headers if not in body
      if (!registerDto.fingerprint && request.headers['x-fingerprint']) {
        registerDto.fingerprint = request.headers['x-fingerprint'];
      }

      const result = await this.authService.register(registerDto);

      return {
        status: 201,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in auth.register:', error);
      return {
        status: error instanceof Error && error.message.includes('already exists') ? 409 : 500,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing auth.login request');

      const loginDto = request.body as LoginDto;
      // Add fingerprint from headers if not in body
      if (!loginDto.fingerprint && request.headers['x-fingerprint']) {
        loginDto.fingerprint = request.headers['x-fingerprint'];
      }

      const result = await this.authService.login(loginDto);

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in auth.login:', error);
      return {
        status: error instanceof Error && error.message.includes('Invalid') ? 401 : 500,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing auth.refresh request');

      // В микросервисной архитектуре refresh token data должны быть извлечены из токена на уровне gateway
      const refreshTokenData = request.user?.refreshTokenData;
      if (!refreshTokenData) {
        return {
          status: 401,
          error: 'Refresh token data not available',
        };
      }

      const refreshDto = request.body as RefreshTokenDto;
      const fingerprint = refreshDto?.fingerprint ?? request.headers['x-fingerprint'];

      const result = await this.authService.refreshTokens(refreshTokenData, fingerprint);

      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in auth.refresh:', error);
      return {
        status: error instanceof Error && error.message.includes('Invalid') ? 401 : 500,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing auth.logout request');

      // В микросервисной архитектуре refresh token data должны быть извлечены из токена на уровне gateway
      const refreshTokenData = request.user?.refreshTokenData;
      if (!refreshTokenData) {
        return {
          status: 401,
          error: 'Refresh token data not available',
        };
      }

      await this.authService.logout(refreshTokenData);

      return {
        status: 200,
        data: { message: 'Logged out successfully' },
      };
    } catch (error) {
      this.logger.error('Error in auth.logout:', error);
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  @MessagePattern('auth.profile')
  async profile(@Payload() request: MicroserviceRequest): Promise<MicroserviceResponse> {
    try {
      this.logger.debug('Processing auth.profile request');

      // В микросервисной архитектуре пользователь уже извлечен из токена на уровне gateway
      const { user } = request;
      if (!user) {
        return {
          status: 401,
          error: 'User not authenticated',
        };
      }

      return {
        status: 200,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          emailVerifiedAt: user.emailVerifiedAt,
          lastLoginAt: user.lastLoginAt,
        },
      };
    } catch (error) {
      this.logger.error('Error in auth.profile:', error);
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Profile fetch failed',
      };
    }
  }
}
