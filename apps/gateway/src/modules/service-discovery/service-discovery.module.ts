import { Module } from '@nestjs/common';
import {
  DynamicRouteMapperService,
  ServiceRegistryService,
  createServiceDiscoveryConfig,
} from '@repo/common';
import { RedisModule, DirectRedisService } from '@repo/infrastructure';

import { ServiceDiscoveryService } from './service-discovery.service';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: 'SERVICE_DISCOVERY_CONFIG',
      useValue: createServiceDiscoveryConfig(),
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
