import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { validationSchema } from './config/validation';
import { PrismaService } from './infrastructure/database/prisma.service';
import { HttpProxyModule } from './infrastructure/http-proxy';
import { AuthModule } from './modules/auth/auth.module';
import { AccessTokenGuard } from './modules/auth/guards/access-token.guard';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

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
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000, // Convert to milliseconds
            limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
          },
        ],
      }),
    }),

    // HTTP Proxy (extension point)
    HttpProxyModule.forRoot({
      config: {
        enabled: false, // Disabled by default
      },
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    // Global database service
    PrismaService,

    // Global guards
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard, // Apply JWT auth globally (use @Public() to bypass)
    },
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
