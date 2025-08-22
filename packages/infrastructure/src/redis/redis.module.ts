import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisOptions } from 'ioredis';

import { ApiCacheService } from './api-cache.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig: RedisOptions = {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        };

        return {
          store: redisStore,
          ...redisConfig,
          ttl: configService.get('CACHE_TTL', 3600), // 1 час по умолчанию
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [RedisService, ApiCacheService],
  exports: [CacheModule, RedisService, ApiCacheService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RedisModule {}
