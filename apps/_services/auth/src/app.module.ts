import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, DiscoveryModule } from '@nestjs/core';
import {
  PrismaExceptionFilter,
  ServiceRegistryModule,
  MicroserviceRegistryService,
  ContractDiscoveryService,
  createServiceDiscoveryConfig,
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

    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
