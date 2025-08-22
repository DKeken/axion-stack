import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@repo/infrastructure';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AccessTokenPayload } from '../types/tokens.type';

import type { AppConfig } from '@/config/configuration';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'access-jwt') {
  private readonly logger = new Logger(AccessJwtStrategy.name);

  constructor(
    readonly configService: ConfigService<AppConfig>,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('access_token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<{ id: string; email: string }> {
    const { sub: userId, email } = payload;

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
      this.logger.warn(`❌ User not found: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    if (user.email !== email) {
      this.logger.warn('❌ Email mismatch:', { userEmail: user.email, tokenEmail: email });
      throw new UnauthorizedException('Token email mismatch');
    }

    return user;
  }
}
