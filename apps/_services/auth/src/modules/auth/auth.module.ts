import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { AuthMicroserviceController } from './auth-microservice.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

import type { AppConfig } from '@/config/configuration';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig>) => ({
        secret: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        // Remove signOptions.expiresIn to avoid conflict with manual exp in payload
        signOptions: {},
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthController, AuthMicroserviceController],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy, PrismaService],
  exports: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
