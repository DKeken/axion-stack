import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import {
  PrismaExceptionFilter,
  ServiceRegistryModule,
  MicroserviceRegistryService,
  ContractDiscoveryService,
  createServiceDiscoveryConfig,
  MetricsModule,
  MicroserviceMetricsInterceptor,
} from '@repo/common';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { validationSchema } from './config/validation';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationSchema,
    }),

    // Infrastructure
    RedisModule,
    DiscoveryModule, // 🔍 NestJS Discovery для автоматического обнаружения MessagePattern
    ServiceRegistryModule.forRootAsync({
      useFactory: () => createServiceDiscoveryConfig(),
    }),
    MetricsModule, // 📊 Metrics for Pushgateway

    // Feature modules
    AuthModule,
    HealthModule,
  ],
  providers: [
    // Global database service
    PrismaService,

    // Service Discovery & Contract Validation
    ContractDiscoveryService, // 🎯 Автоматическая валидация против ts-rest контрактов
    MicroserviceRegistryService,

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceMetricsInterceptor, // 📊 Collect RPC metrics
    },

    // Global filters
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
