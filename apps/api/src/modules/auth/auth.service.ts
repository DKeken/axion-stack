import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
  RefreshTokenData,
} from './types/tokens.type';
import type { AppConfig } from '@/config/configuration';
import type { LoginDto, RegisterDto, UserResponse } from '@/contracts/auth.contract';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { withTransaction, type DatabaseClient } from '@/infrastructure/database/transaction';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: UserResponse; tokens: TokenPair }> {
    const { email, password, name, fingerprint } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user and initial token pair in transaction
    return withTransaction(this.prisma, async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const tokens = await this.generateTokenPair(user.id, user.email, fingerprint, tx);

      return {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        tokens,
      };
    });
  }

  async login(loginDto: LoginDto): Promise<{ user: UserResponse; tokens: TokenPair }> {
    const { email, password, fingerprint } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokenPair(user.id, user.email, fingerprint);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        createdAt: userWithoutPassword.createdAt.toISOString(),
        updatedAt: userWithoutPassword.updatedAt.toISOString(),
      },
      tokens,
    };
  }

  async refreshTokens(
    refreshTokenData: RefreshTokenData,
    fingerprint?: string
  ): Promise<TokenPair> {
    const { userId, jti, familyId } = refreshTokenData;

    return withTransaction(this.prisma, async (tx) => {
      // Mark current refresh token as used
      await tx.refreshToken.update({
        where: { jti },
        data: { usedAt: new Date() },
      });

      // Get user info
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new token pair with same family ID
      return this.generateTokenPair(user.id, user.email, fingerprint, tx, familyId);
    });
  }

  async logout(refreshTokenData: RefreshTokenData): Promise<void> {
    const { jti } = refreshTokenData;

    await this.prisma.refreshToken.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokenPair(
    userId: string,
    email: string,
    fingerprint?: string,
    tx: DatabaseClient = this.prisma,
    existingFamilyId?: string
  ): Promise<TokenPair> {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET', { infer: true });
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET', { infer: true });
    const accessExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN', { infer: true });
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true });

    // Generate JTI and family ID
    const jti = uuidv4();
    const familyId = existingFamilyId || uuidv4();

    // Create access token payload
    const accessPayload: AccessTokenPayload = {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(accessExpiresIn || '15m'),
    };

    // Create refresh token payload
    const refreshPayload: RefreshTokenPayload = {
      sub: userId,
      email,
      jti,
      familyId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(refreshExpiresIn || '7d'),
    };

    // Generate tokens (exp already set in payload, don't use expiresIn option)
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: accessSecret,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
    });

    // Store refresh token in database
    const fingerprintHash = fingerprint ? await argon2.hash(fingerprint) : null;
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await tx.refreshToken.create({
      data: {
        userId,
        jti,
        familyId,
        fingerprintHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(accessExpiresIn || '15m'),
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const [, amount, unit] = match;
    if (!amount || !unit) {
      throw new Error(`Invalid duration format: ${expiresIn}`);
    }
    const multiplier = units[unit];
    if (multiplier === undefined) {
      throw new Error(`Unknown time unit: ${unit}`);
    }
    return parseInt(amount, 10) * multiplier;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
