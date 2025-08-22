import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

/**
 * Redis сервис для работы с кэшем через cache-manager
 * Предоставляет удобные методы для работы с Redis
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Установить значение в кэш с TTL
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds * 1000); // cache-manager использует миллисекунды
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
  }

  /**
   * Удалить несколько ключей из кэша
   */
  async delMultiple(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
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
}
