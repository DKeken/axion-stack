import { Module } from '@nestjs/common';
import { DynamicRouteMapperService, ServiceRegistryService } from '@repo/common';
import { RedisModule, DirectRedisService } from '@repo/infrastructure';

import { ServiceDiscoveryService } from './service-discovery.service';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: 'SERVICE_DISCOVERY_CONFIG',
      useValue: {
        registryPrefix: 'axion:services',
        heartbeatInterval: 30000,
        serviceTtl: 120, // Унифицируем TTL для стабильности
        enableCleanup: true,
      },
    },
    {
      provide: 'DIRECT_REDIS_SERVICE',
      useExisting: DirectRedisService,
    },
    ServiceRegistryService,
    ServiceDiscoveryService,
    DynamicRouteMapperService,
  ],
  exports: [ServiceDiscoveryService, DynamicRouteMapperService],
})
export class ServiceDiscoveryModule {}
