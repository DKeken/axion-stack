import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { RefreshTokenPayload, RefreshTokenData } from '../types/tokens.type';
import type { AppConfig } from '@/config/configuration';

import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Try to extract from httpOnly cookie first
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
        // Fallback to Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET', { infer: true }),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: RefreshTokenPayload
  ): Promise<{ refreshTokenData: RefreshTokenData }> {
    const { sub: userId, email, jti, familyId } = payload;

    // Verify user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.email !== email) {
      throw new UnauthorizedException('Token email mismatch');
    }

    // Verify refresh token exists and is valid
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

    // Return the complete refresh token data
    return {
      refreshTokenData: refreshToken,
    };
  }

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
