import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from './redis.service';
import { CacheKeyBuilder } from './types';

export interface ApiCacheOptions {
  ttl?: number;
  keyPrefix?: string;
  skipSerialization?: boolean;
}

export interface CacheKeyParams {
  module: string;
  operation: string;
  params?: Record<string, unknown>;
  userId?: string;
}

/**
 * Сервис для кэширования API ответов
 * Предоставляет унифицированные методы для работы с кэшированием на уровне API
 */
@Injectable()
export class ApiCacheService {
  private readonly logger = new Logger(ApiCacheService.name);
  private readonly defaultTTL = 300; // 5 minutes

  constructor(private readonly redisService: RedisService) {}

  /**
   * Кэшировать API ответ
   */
  async cache<T>(keyParams: CacheKeyParams, data: T, options: ApiCacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.buildApiCacheKey(keyParams);
      const ttl = options.ttl ?? this.defaultTTL;

      const serializedData = options.skipSerialization ? (data as string) : JSON.stringify(data);

      await this.redisService.set(cacheKey, serializedData, ttl);

      this.logger.debug(`Cached API response: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      // Не бросаем ошибку - проблемы с кэшированием не должны ломать запрос
      this.logger.error('Failed to cache API response:', error);
    }
  }

  /**
   * Получить кэшированный API ответ
   */
  async get<T>(keyParams: CacheKeyParams, options: ApiCacheOptions = {}): Promise<T | null> {
    try {
      const cacheKey = this.buildApiCacheKey(keyParams);
      const cached = await this.redisService.get(cacheKey);

      if (!cached) {
        this.logger.debug(`Cache miss: ${cacheKey}`);
        return null;
      }

      this.logger.debug(`Cache hit: ${cacheKey}`);

      return options.skipSerialization ? (cached as T) : (JSON.parse(cached) as T);
    } catch (error) {
      // Не бросаем ошибку - проблемы с кэшем не должны ломать запрос
      this.logger.error('Failed to get cached API response:', error);
      return null;
    }
  }

  /**
   * Инвалидировать кэш для конкретного модуля
   */
  async invalidateModule(module: string): Promise<void> {
    try {
      // Поскольку cache-manager не поддерживает keys по паттерну,
      // используем более простой подход - очищаем весь кэш
      // В продакшене можно вести отдельный набор ключей для каждого модуля
      await this.redisService.reset();

      this.logger.debug(`Invalidated cache for module: ${module}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for module ${module}:`, error);
    }
  }

  /**
   * Инвалидировать кэш для конкретной операции
   */
  async invalidateOperation(module: string, operation: string): Promise<void> {
    try {
      // Аналогично - очищаем весь кэш
      // TODO: Реализовать более точную инвалидацию когда будет поддержка pattern keys
      await this.redisService.reset();

      this.logger.debug(`Invalidated cache for ${module}.${operation}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for ${module}.${operation}:`, error);
    }
  }

  /**
   * Очистить весь API кэш
   */
  async clear(): Promise<void> {
    try {
      await this.redisService.reset();
      this.logger.debug('Cleared all API cache');
    } catch (error) {
      this.logger.error('Failed to clear API cache:', error);
    }
  }

  /**
   * Построить ключ кэша для API
   */
  private buildApiCacheKey(keyParams: CacheKeyParams): string {
    const { module, operation, params = {}, userId } = keyParams;

    // Сериализуем параметры в детерминированном порядке
    const serializedParams = this.serializeParams(params);

    const keyParts: (string | number)[] = [];

    if (userId) {
      keyParts.push(`user_${userId}`);
    }

    if (serializedParams) {
      keyParts.push(serializedParams);
    }

    return CacheKeyBuilder.buildApiKey(module, operation, ...keyParts);
  }

  /**
   * Сериализация параметров для ключа кэша
   */
  private serializeParams(params: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return 'no_params';
    }

    const entries = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b)) // Детерминированный порядок
      .map(([key, value]) => {
        if (typeof value === 'object') {
          // Для объектов создаем хэш
          return `${key}_${this.hashObject(value)}`;
        }
        // Очищаем значение от спецсимволов
        const cleanValue = String(value).replace(/[^a-zA-Z0-9]/g, '_');
        return `${key}_${cleanValue}`;
      });

    // Создаём короткий хэш из всех параметров для компактности
    const paramString = entries.join('|');
    return this.createShortHash(paramString);
  }

  /**
   * Создание хэша для объектов
   */
  private hashObject(obj: unknown): string {
    try {
      const str = JSON.stringify(obj, Object.keys(obj as object).sort());
      return this.createShortHash(str);
    } catch {
      return 'unknown';
    }
  }

  /**
   * Создание короткого хэша из строки
   */
  private createShortHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8); // Base36, first 8 chars
  }

  /**
   * Получить TTL для операции
   */
  getTTLForOperation(module: string, operation: string): number {
    const ttlMap: Record<string, Record<string, number>> = {
      users: {
        list: 180, // 3 minutes
        getById: 300, // 5 minutes
        create: 0, // Don't cache
        update: 0, // Don't cache
        delete: 0, // Don't cache
      },
      auth: {
        me: 300, // 5 minutes
        login: 0, // Don't cache
        refresh: 0, // Don't cache
        logout: 0, // Don't cache
      },
    };

    return ttlMap[module]?.[operation] ?? this.defaultTTL;
  }
}
