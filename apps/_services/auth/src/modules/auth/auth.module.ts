import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { AuthMicroserviceController } from './auth-microservice.controller';
import { AuthService } from './auth.service';

import type { AppConfig } from '@/config/configuration';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig>) => ({
        secret: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {},
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthMicroserviceController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
