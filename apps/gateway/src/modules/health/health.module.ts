import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@repo/infrastructure';

import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';

import { HealthRabbitMQService } from './health-rabbitmq.service';
import { HealthStartupService } from './health-startup.service';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule, ServiceDiscoveryModule, RedisModule],
  controllers: [HealthController],
  providers: [HealthRabbitMQService, HealthStartupService],
})
export class HealthModule {}
