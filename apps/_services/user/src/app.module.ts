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
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validationSchema,
    }),
    RedisModule,
    DiscoveryModule,
    ServiceRegistryModule.forRootAsync({
      useFactory: () => createServiceDiscoveryConfig(),
    }),
    MetricsModule, // 📊 Metrics for Pushgateway
    UsersModule,
    HealthModule,
  ],
  providers: [
    PrismaService,
    ContractDiscoveryService,
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
