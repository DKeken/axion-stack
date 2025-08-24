import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  TsRestValidationUtils,
  type MicroserviceRequestPayload,
  type MicroserviceResponse,
} from '@repo/common';
import { authContract } from '@repo/contracts';

import { AuthService } from './auth.service';

// No need for custom interface - use MicroserviceRequestPayload directly with type safety

@Controller()
export class AuthMicroserviceController {
  private readonly logger = new Logger(AuthMicroserviceController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('health.check')
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }

  @MessagePattern('auth.register')
  async register(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(authContract.register, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.body) {
      return TsRestValidationUtils.createErrorResponse(400, 'Request body is required');
    }

    try {
      // After validation, data.body is properly typed as RegisterDto
      const result = await this.authService.register(validation.data.body);
      return TsRestValidationUtils.createResponse(201, result);
    } catch (error) {
      this.logger.error('Auth register error:', error);
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Registration failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(authContract.login, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.body) {
      return TsRestValidationUtils.createErrorResponse(400, 'Request body is required');
    }

    try {
      // After validation, data.body is properly typed as LoginDto
      const result = await this.authService.login(validation.data.body);
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Auth login error:', error);
      return TsRestValidationUtils.createErrorResponse(
        401,
        'Login failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(authContract.refresh, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!validation.data.body) {
      return TsRestValidationUtils.createErrorResponse(400, 'Request body is required');
    }

    try {
      // For refresh, we need to get the refresh token from somewhere
      // Usually it would be in headers/cookies, but for now get from user context
      if (!payload.user?.refreshTokenData?.jti) {
        return TsRestValidationUtils.createErrorResponse(400, 'Refresh token is required');
      }

      // Get fingerprint from validated body (now properly typed)
      const refreshBody = validation.data.body;

      // Use refresh token data from user context
      const baseRefreshTokenData = payload.user.refreshTokenData;
      if (!baseRefreshTokenData) {
        return TsRestValidationUtils.createErrorResponse(400, 'Refresh token data not found');
      }

      const refreshTokenData = {
        ...baseRefreshTokenData,
        fingerprintHash: refreshBody?.fingerprint,
      };
      const result = await this.authService.refreshTokens(
        refreshTokenData,
        refreshBody?.fingerprint
      );
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Auth refresh error:', error);
      return TsRestValidationUtils.createErrorResponse(
        401,
        'Token refresh failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract
    const validation = TsRestValidationUtils.validateRequest(authContract.logout, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!payload.user?.id) {
      return TsRestValidationUtils.createErrorResponse(401, 'User not authenticated for logout');
    }

    try {
      // Use refresh token data from user context
      const { refreshTokenData } = payload.user;
      if (!refreshTokenData) {
        return TsRestValidationUtils.createErrorResponse(400, 'Refresh token data not found');
      }

      await this.authService.logout(refreshTokenData);
      return TsRestValidationUtils.createResponse(200, { message: 'Logged out successfully' });
    } catch (error) {
      this.logger.error('Auth logout error:', error);
      return TsRestValidationUtils.createErrorResponse(
        400,
        'Logout failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  @MessagePattern('auth.profile')
  async profile(@Payload() payload: MicroserviceRequestPayload): Promise<MicroserviceResponse> {
    // Validate request against ts-rest contract (profile usually doesn't need body validation)
    const validation = TsRestValidationUtils.validateRequest(authContract.profile, payload);

    if (!validation.success) {
      return TsRestValidationUtils.createErrorResponse(400, 'Validation failed', validation.error);
    }

    if (!payload.user?.id) {
      return TsRestValidationUtils.createErrorResponse(401, 'User not authenticated');
    }

    try {
      const userId = payload.user.id;
      const result = await this.authService.getProfile(userId);
      return TsRestValidationUtils.createResponse(200, result);
    } catch (error) {
      this.logger.error('Auth profile error:', error);
      return TsRestValidationUtils.createErrorResponse(
        404,
        'Profile not found',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
