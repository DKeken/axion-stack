import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@repo/infrastructure/database';

import type { MicroserviceUser } from '../../types/microservices.types';
import type {
  AccessTokenPayload,
  RefreshTokenData,
  RefreshTokenPayload,
} from '../types/tokens.type';
import type { Request } from 'express';

@Injectable()
export class JwtValidationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Extract refresh token from request (cookie or Authorization header)
   */
  extractRefreshToken(req: Request): string | null {
    // Try httpOnly cookie first
    if (req.cookies?.refreshToken) {
      return req.cookies.refreshToken;
    }

    // Fallback to Authorization header
    const { authorization } = req.headers;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    return null;
  }

  /**
   * Extract access token from Authorization header
   */
  extractAccessToken(req: Request): string | null {
    const { authorization } = req.headers;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.substring(7);
    }
    return null;
  }

  /**
   * Validate refresh token and return user with refresh token data
   */
  async validateRefreshToken(token: string): Promise<MicroserviceUser> {
    try {
      const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: refreshSecret,
      });

      const { sub: userId, email, jti, familyId } = payload;

      // Verify user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          status: true,
          emailVerified: true,
          timezone: true,
          language: true,
          theme: true,
          lastLoginIp: true,
          createdAt: true,
          updatedAt: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.email !== email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      // Verify refresh token exists and is valid
      const refreshTokenData = await this.validateRefreshTokenInDB(jti, familyId);

      return {
        ...user,
        refreshTokenData: {
          ...refreshTokenData,
          fingerprintHash: refreshTokenData.fingerprintHash ?? null,
          revokedAt: refreshTokenData.revokedAt ?? null,
          usedAt: refreshTokenData.usedAt ?? null,
        },
      };
    } catch (_error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate access token and return user
   */
  async validateAccessToken(token: string): Promise<MicroserviceUser> {
    try {
      const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
      const payload = this.jwtService.verify<AccessTokenPayload>(token, {
        secret: accessSecret,
      });

      const { sub: userId, email } = payload;

      // Verify user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          status: true,
          emailVerified: true,
          timezone: true,
          language: true,
          theme: true,
          lastLoginIp: true,
          createdAt: true,
          updatedAt: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.email !== email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      return user;
    } catch (_error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Extract and validate user from request
   */
  async extractUserFromRequest(req: Request): Promise<MicroserviceUser | null> {
    // First try refresh token (for refresh endpoint and other auth operations)
    const refreshToken = this.extractRefreshToken(req);
    if (refreshToken) {
      try {
        return await this.validateRefreshToken(refreshToken);
      } catch {
        // If refresh token is invalid, try access token
      }
    }

    // Try access token for other endpoints
    const accessToken = this.extractAccessToken(req);
    if (accessToken) {
      try {
        return await this.validateAccessToken(accessToken);
      } catch {
        // Token is invalid
      }
    }

    return null;
  }

  /**
   * Validate refresh token in database
   */
  private async validateRefreshTokenInDB(jti: string, familyId: string): Promise<RefreshTokenData> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { jti },
      select: {
        id: true,
        userId: true,
        jti: true,
        familyId: true,
        fingerprintHash: true,
        expiresAt: true,
        revokedAt: true,
        usedAt: true,
        createdAt: true,
      },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (refreshToken.revokedAt) {
      // Token reuse detected - revoke all tokens in the family
      await this.revokeTokenFamily(familyId);
      throw new UnauthorizedException('Token reuse detected - all sessions revoked');
    }

    if (refreshToken.usedAt) {
      // Token has already been used - this might be reuse
      await this.revokeTokenFamily(familyId);
      throw new UnauthorizedException('Token already used - potential reuse detected');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return refreshToken;
  }

  /**
   * Revoke all tokens in a family (used for token reuse detection)
   */
  private async revokeTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        familyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
