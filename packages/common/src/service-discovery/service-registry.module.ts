import { type DynamicModule, Module, type InjectionToken } from '@nestjs/common';
import { RedisModule, DirectRedisService } from '@repo/infrastructure';

import { ServiceRegistryService } from './service-registry.service';

import type { ServiceDiscoveryConfig } from './types';

@Module({})
export class ServiceRegistryModule {
  static forRoot(config: ServiceDiscoveryConfig): DynamicModule {
    return {
      module: ServiceRegistryModule,
      providers: [
        {
          provide: 'SERVICE_DISCOVERY_CONFIG',
          useValue: config,
        },
        ServiceRegistryService,
      ],
      exports: [ServiceRegistryService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: never[]) => Promise<ServiceDiscoveryConfig> | ServiceDiscoveryConfig;
    inject?: InjectionToken[];
  }): DynamicModule {
    return {
      module: ServiceRegistryModule,
      imports: [RedisModule], // 🔧 Импортируем RedisModule для доступа к RedisService
      providers: [
        {
          provide: 'SERVICE_DISCOVERY_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ServiceRegistryService,
        {
          provide: 'DIRECT_REDIS_SERVICE',
          useExisting: DirectRedisService,
        },
      ],
      exports: [ServiceRegistryService],
      global: true,
    };
  }
}
