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
    UsersModule,
    HealthModule,
  ],
  providers: [
    PrismaService,
    ContractDiscoveryService,
    MicroserviceRegistryService,

    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
