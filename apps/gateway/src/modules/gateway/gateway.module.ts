import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtValidationService } from '@repo/common';
import { PrismaService } from '@repo/infrastructure/database';

import { MetricsModule } from '../metrics/metrics.module';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // Empty config since we manually specify secrets
    ServiceDiscoveryModule,
    MetricsModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, JwtValidationService, PrismaService],
  exports: [GatewayService],
})
export class GatewayModule {}
