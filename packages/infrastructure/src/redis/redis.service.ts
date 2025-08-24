import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { Cache } from 'cache-manager';

/**
 * Cache key registry for tracking cached keys by modules and operations
 */
interface CacheKeyRegistry {
  modules: Map<string, Set<string>>; // module -> keys
  operations: Map<string, Set<string>>; // module:operation -> keys
}

/**
 * Интерфейсы для правильной типизации cache-manager
 */
interface RedisClient {
  keys: (pattern: string) => Promise<string[]>;
  [key: string]: unknown;
}

interface CacheStore {
  getClient?: () => RedisClient;
  [key: string]: unknown;
}

interface CacheManagerWithStore extends Omit<Cache, 'store'> {
  store?: CacheStore;
}

/**
 * Redis сервис для работы с кэшем через cache-manager
 * Предоставляет удобные методы для работы с Redis и реестром ключей
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly keyRegistry: CacheKeyRegistry = {
    modules: new Map(),
    operations: new Map(),
  };

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: CacheManagerWithStore) {}

  /**
   * Установить значение в кэш с TTL
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds * 1000); // cache-manager использует миллисекунды

    // Регистрируем ключ в локальном реестре для pattern search
    this.registerKey(key);
  }

  /**
   * Установить значение в кэш с регистрацией в реестре
   */
  async setWithRegistry(
    key: string,
    value: string,
    ttlSeconds: number,
    module?: string,
    operation?: string
  ): Promise<void> {
    await this.set(key, value, ttlSeconds);
    this.registerKey(key, module, operation);
  }

  /**
   * Получить значение из кэша
   */
  async get(key: string): Promise<string | undefined> {
    return await this.cacheManager.get<string>(key);
  }

  /**
   * Удалить ключ из кэша
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.unregisterKey(key);
  }

  /**
   * Удалить несколько ключей из кэша
   */
  async delMultiple(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
    keys.forEach((key) => this.unregisterKey(key));
  }

  /**
   * Инвалидировать все ключи модуля
   */
  async invalidateModule(module: string): Promise<number> {
    const moduleKeys = this.keyRegistry.modules.get(module);
    if (!moduleKeys || moduleKeys.size === 0) {
      this.logger.debug(`No keys found for module: ${module}`);
      return 0;
    }

    const keys = Array.from(moduleKeys);
    await this.delMultiple(keys);

    // Очищаем записи о модуле
    this.keyRegistry.modules.delete(module);

    // Очищаем записи об операциях этого модуля
    const operationKeysToDelete: string[] = [];
    for (const [operationKey] of this.keyRegistry.operations) {
      if (operationKey.startsWith(`${module}:`)) {
        operationKeysToDelete.push(operationKey);
      }
    }
    operationKeysToDelete.forEach((key) => this.keyRegistry.operations.delete(key));

    this.logger.debug(`Invalidated ${keys.length} keys for module: ${module}`);
    return keys.length;
  }

  /**
   * Инвалидировать все ключи конкретной операции
   */
  async invalidateOperation(module: string, operation: string): Promise<number> {
    const operationKey = `${module}:${operation}`;
    const operationKeys = this.keyRegistry.operations.get(operationKey);

    if (!operationKeys || operationKeys.size === 0) {
      this.logger.debug(`No keys found for operation: ${operationKey}`);
      return 0;
    }

    const keys = Array.from(operationKeys);
    await this.delMultiple(keys);

    // Очищаем записи об операции
    this.keyRegistry.operations.delete(operationKey);

    this.logger.debug(`Invalidated ${keys.length} keys for operation: ${operationKey}`);
    return keys.length;
  }

  /**
   * Получить все ключи по паттерну через прямое подключение к Redis
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      this.logger.debug(`🔍 [RedisService] Searching keys with pattern: ${pattern}`);

      // Получаем Redis client из cache-manager
      const { store } = this.cacheManager;
      this.logger.debug(`🔌 [RedisService] Store available: ${!!store}`);

      if (store?.getClient) {
        const client = store.getClient();
        this.logger.debug(
          `🔌 [RedisService] Client available: ${!!client}, has keys method: ${client && typeof client.keys === 'function'}`
        );

        if (client && typeof client.keys === 'function') {
          const keys = await client.keys(pattern);
          this.logger.debug(
            `🔑 [RedisService] Direct Redis found ${keys.length} keys: [${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}]`
          );
          return keys;
        }
      }

      this.logger.warn(`⚠️ [RedisService] Falling back to registry search for pattern: ${pattern}`);
      // Fallback: поиск по локальному реестру ключей
      return this.searchInRegistry(pattern);
    } catch (error) {
      this.logger.error(`❌ [RedisService] Error searching keys with pattern ${pattern}:`, error);
      return this.searchInRegistry(pattern);
    }
  }

  /**
   * Поиск ключей в локальном реестре по паттерну
   */
  private searchInRegistry(pattern: string): string[] {
    const allKeys: string[] = [];

    // Собираем все ключи из реестра
    for (const keys of this.keyRegistry.modules.values()) {
      allKeys.push(...Array.from(keys));
    }

    // Преобразуем glob pattern в regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);

    const matchingKeys = allKeys.filter((key) => regex.test(key));
    this.logger.debug(
      `🔍 Registry search found ${matchingKeys.length} keys matching pattern: ${pattern}`
    );

    return matchingKeys;
  }

  /**
   * Очистить весь кэш
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset();
    // Очищаем также реестр ключей
    this.keyRegistry.modules.clear();
    this.keyRegistry.operations.clear();
  }

  /**
   * Проверить соединение с Redis (эмуляция ping)
   */
  async ping(): Promise<string> {
    try {
      // Простая проверка - запишем и прочитаем тестовое значение
      const testKey = 'health-check';
      await this.set(testKey, 'pong', 1);
      const result = await this.get(testKey);
      await this.del(testKey);
      return result === 'pong' ? 'PONG' : 'ERROR';
    } catch {
      return 'ERROR';
    }
  }

  /**
   * Публиковать сообщение в Redis pub/sub канал
   */
  async publish(channel: string, message: string): Promise<void> {
    try {
      // Получаем Redis client из cache-manager
      const { store } = this.cacheManager;

      if (store?.getClient) {
        const client = store.getClient();

        if (client && typeof client.publish === 'function') {
          await client.publish(channel, message);
          this.logger.debug(`📢 [RedisService] Published message to channel: ${channel}`);
          return;
        }
      }

      this.logger.warn(
        `⚠️ [RedisService] Redis publish not available, message not sent to channel: ${channel}`
      );
    } catch (error) {
      this.logger.error(`❌ [RedisService] Error publishing to channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Зарегистрировать ключ в реестре
   */
  private registerKey(key: string, module?: string, operation?: string): void {
    if (module) {
      // Регистрируем ключ для модуля
      if (!this.keyRegistry.modules.has(module)) {
        this.keyRegistry.modules.set(module, new Set());
      }
      const moduleSet = this.keyRegistry.modules.get(module);
      if (moduleSet) {
        moduleSet.add(key);
      }

      // Регистрируем ключ для операции, если указана
      if (operation) {
        const operationKey = `${module}:${operation}`;
        if (!this.keyRegistry.operations.has(operationKey)) {
          this.keyRegistry.operations.set(operationKey, new Set());
        }
        const operationSet = this.keyRegistry.operations.get(operationKey);
        if (operationSet) {
          operationSet.add(key);
        }
      }
    }
  }

  /**
   * Разрегистрировать ключ из реестра
   */
  private unregisterKey(key: string): void {
    // Удаляем ключ из всех модулей
    for (const [module, keys] of this.keyRegistry.modules) {
      if (keys.has(key)) {
        keys.delete(key);
        // Если набор пустой, удаляем модуль
        if (keys.size === 0) {
          this.keyRegistry.modules.delete(module);
        }
      }
    }

    // Удаляем ключ из всех операций
    for (const [operationKey, keys] of this.keyRegistry.operations) {
      if (keys.has(key)) {
        keys.delete(key);
        // Если набор пустой, удаляем операцию
        if (keys.size === 0) {
          this.keyRegistry.operations.delete(operationKey);
        }
      }
    }
  }

  /**
   * Получить статистику реестра ключей
   */
  getRegistryStats(): {
    totalModules: number;
    totalOperations: number;
    totalKeys: number;
    moduleStats: Record<string, number>;
  } {
    const moduleStats: Record<string, number> = {};
    let totalKeys = 0;

    for (const [module, keys] of this.keyRegistry.modules) {
      moduleStats[module] = keys.size;
      totalKeys += keys.size;
    }

    return {
      totalModules: this.keyRegistry.modules.size,
      totalOperations: this.keyRegistry.operations.size,
      totalKeys,
      moduleStats,
    };
  }
}
