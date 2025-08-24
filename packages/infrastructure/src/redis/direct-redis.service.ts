import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Direct Redis Service без cache-manager
 * Для Service Discovery нужен прямой доступ к Redis
 */
@Injectable()
export class DirectRedisService implements OnModuleInit {
  private readonly logger = new Logger(DirectRedisService.name);
  private redis!: Redis;
  private subscriberRedis?: Redis; // Отдельное соединение для pub/sub

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      db: this.configService.get('REDIS_DB', 0),
      password: this.configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.redis = new Redis(redisConfig);

    try {
      await this.redis.connect();
      const ping = await this.redis.ping();
      this.logger.log(`Direct Redis connected: ${ping}`);

      this.logger.debug(
        `Redis config: host=${redisConfig.host}, port=${redisConfig.port}, db=${redisConfig.db}`
      );
    } catch (error) {
      this.logger.error('Direct Redis connection failed:', error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redis.keys(pattern);
      this.logger.debug(`[DirectRedis] Found ${keys.length} keys for pattern: ${pattern}`);
      return keys;
    } catch (error) {
      this.logger.error(`[DirectRedis] Keys search failed for pattern ${pattern}:`, error);
      return [];
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`❌ [DirectRedis] Get failed for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      this.logger.error(`❌ [DirectRedis] Set failed for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`❌ [DirectRedis] Delete failed for key ${key}:`, error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('❌ [DirectRedis] Ping failed:', error);
      return 'ERROR';
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.redis.publish(channel, message);
      this.logger.debug(`📢 [DirectRedis] Published message to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`❌ [DirectRedis] Publish failed for channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Создать отдельное соединение для pub/sub подписки
   */
  async createSubscriber(): Promise<Redis> {
    if (this.subscriberRedis) {
      return this.subscriberRedis;
    }

    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      db: this.configService.get('REDIS_DB', 0),
      password: this.configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.subscriberRedis = new Redis(redisConfig);

    try {
      await this.subscriberRedis.connect();
      this.logger.debug('🔌 [DirectRedis] Subscriber connection established');
      return this.subscriberRedis;
    } catch (error) {
      this.logger.error('❌ [DirectRedis] Subscriber connection failed:', error);
      throw error;
    }
  }

  /**
   * Подписаться на Redis канал
   */
  async subscribe(
    channel: string,
    messageHandler: (channel: string, message: string) => void,
    errorHandler?: (error: Error) => void
  ): Promise<void> {
    try {
      const subscriber = await this.createSubscriber();

      // Настраиваем обработчики
      subscriber.on('message', messageHandler);

      if (errorHandler) {
        subscriber.on('error', errorHandler);
      }

      subscriber.on('connect', () => {
        this.logger.debug('🔌 [DirectRedis] Subscriber reconnected');
      });

      // Подписываемся на канал
      await subscriber.subscribe(channel);
      this.logger.debug(`📡 [DirectRedis] Subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`❌ [DirectRedis] Subscribe failed for channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Отписаться от всех каналов и закрыть subscriber соединение
   */
  async unsubscribeAll(): Promise<void> {
    if (this.subscriberRedis) {
      try {
        await this.subscriberRedis.unsubscribe();
        this.subscriberRedis.disconnect();
        this.subscriberRedis = undefined;
        this.logger.debug('🔌 [DirectRedis] Subscriber disconnected');
      } catch (error) {
        this.logger.warn('⚠️ [DirectRedis] Error disconnecting subscriber:', error);
      }
    }
  }
}
