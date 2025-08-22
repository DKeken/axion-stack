import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  PrismaExceptionFilter,
  TransformInterceptor,
} from '@repo/common';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { validationSchema } from './config/validation';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationSchema,
    }),

    // Redis cache
    RedisModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
            limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
          },
        ],
      }),
    }),

    // Feature modules
    UsersModule,
    HealthModule,
  ],
  providers: [
    // Global database service
    PrismaService,

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
