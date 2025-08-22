import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
  LoggingInterceptor,
  TransformInterceptor,
} from '@repo/common';
import { PrismaService } from '@repo/infrastructure';

import { validationSchema } from './config/validation';
import { GatewayModule } from './modules/gateway/gateway.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationSchema,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000, // Convert to milliseconds
            limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
          },
        ],
      }),
    }),

    // Feature modules
    GatewayModule,
    HealthModule,
  ],
  providers: [
    // Global database service
    PrismaService,

    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Apply rate limiting globally
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Log all requests
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // Transform responses consistently
    },

    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // Handle HTTP exceptions
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter, // Handle Prisma exceptions
    },
  ],
})
export class AppModule {}
