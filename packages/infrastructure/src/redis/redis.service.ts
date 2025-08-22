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

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Установить значение в кэш с TTL
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds * 1000); // cache-manager использует миллисекунды
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
   * Получить все ключи по паттерну (эмуляция)
   * Примечание: cache-manager не поддерживает keys напрямую, это упрощенная версия
   */
  async keys(pattern: string): Promise<string[]> {
    // В продакшене лучше вести список ключей отдельно
    // Для простоты возвращаем пустой массив
    this.logger.warn(`Redis keys pattern "${pattern}" not fully supported with cache-manager`);
    return [];
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
   * Зарегистрировать ключ в реестре
   */
  private registerKey(key: string, module?: string, operation?: string): void {
    if (module) {
      // Регистрируем ключ для модуля
      if (!this.keyRegistry.modules.has(module)) {
        this.keyRegistry.modules.set(module, new Set());
      }
      this.keyRegistry.modules.get(module)!.add(key);

      // Регистрируем ключ для операции, если указана
      if (operation) {
        const operationKey = `${module}:${operation}`;
        if (!this.keyRegistry.operations.has(operationKey)) {
          this.keyRegistry.operations.set(operationKey, new Set());
        }
        this.keyRegistry.operations.get(operationKey)!.add(key);
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
