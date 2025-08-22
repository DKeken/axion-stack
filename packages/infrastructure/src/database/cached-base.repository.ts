import { Logger } from '@nestjs/common';

import {
  type CacheParams,
  type ICacheableRepository,
  type SerializableObject,
  type SerializableValue,
  type RedisService,
  CacheKeyBuilder,
} from '../redis';

import { BaseRepository } from './base.repository';
import type {
  CursorPaginationOptions,
  DatabaseClient,
  OffsetPaginationOptions,
  PaginationResult,
} from './transaction';

/**
 * Cached base repository with Redis integration
 */
export abstract class CachedBaseRepository<
    TModel extends Record<string, SerializableValue>,
    TWhereInput,
    TOrderByInput,
    TSelectInput,
    TIncludeInput,
    TCreateInput,
    TUpdateInput,
  >
  extends BaseRepository<
    TModel,
    TWhereInput,
    TOrderByInput,
    TSelectInput,
    TIncludeInput,
    TCreateInput,
    TUpdateInput
  >
  implements ICacheableRepository
{
  protected readonly logger = new Logger(this.constructor.name);
  protected cacheParams: CacheParams = { operation: '', args: '' };

  constructor(
    protected override readonly defaultDb: DatabaseClient,
    protected readonly redisService: RedisService
  ) {
    super(defaultDb);
  }

  /**
   * Get cache key for operation
   */
  getCacheKey(operation: string, params: CacheParams): string {
    const repositoryName = this.constructor.name.toLowerCase().replace('repository', '');
    return CacheKeyBuilder.buildRepoKey(repositoryName, operation, params.args);
  }

  /**
   * Get TTL for specific operation
   */
  getCacheTTL(operation: string): number {
    const ttlMap: Record<string, number> = {
      findUnique: 300, // 5 minutes
      findFirst: 300, // 5 minutes
      findMany: 180, // 3 minutes
      count: 60, // 1 minute
    };

    return ttlMap[operation] || 300; // Default 5 minutes
  }

  /**
   * Check if operation should be cached
   */
  shouldCache(operation: string, params: CacheParams): boolean {
    const cacheableOperations = ['findUnique', 'findFirst', 'findMany', 'count'];

    if (!cacheableOperations.includes(operation)) {
      return false;
    }

    // Don't cache if params include dynamic fields like dates
    for (const [key, _value] of Object.entries(params)) {
      if (key.includes('date') || key.includes('time') || key.includes('updated')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Implementation of ICacheableRepository interface
   */
  async clearCache(key?: string): Promise<void> {
    if (key) {
      await this.redisService.del(key);
    } else {
      await this.invalidateRepositoryCache();
    }
  }

  setCacheParams(params: CacheParams): void {
    // Simple implementation - could be extended to store params per instance
    this.cacheParams = { ...this.cacheParams, ...params };
  }

  /**
   * Invalidate cache patterns
   */
  async invalidateCache(patterns: readonly string[]): Promise<void> {
    try {
      // Для простоты очистим весь кэш, так как cache-manager не поддерживает keys по паттерну
      await this.redisService.reset();
      this.logger.debug(`Invalidated cache patterns: ${patterns.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to invalidate cache:', error);
    }
  }

  /**
   * Cached findUnique implementation
   */
  async findUniqueWithCache(
    where: TWhereInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel | null> {
    const params = this.buildCacheParams('findUnique', { where, ...options });

    if (!this.shouldCache('findUnique', params)) {
      return this.findUnique(where, options, db);
    }

    const cacheKey = this.getCacheKey('findUnique', params);

    try {
      // Try to get from cache
      const cachedStr = await this.redisService.get(cacheKey);
      const cached = cachedStr ? (JSON.parse(cachedStr) as TModel) : null;
      if (cached !== null) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Cache miss - fetch from database
      this.logger.debug(`Cache miss for ${cacheKey}`);
      const result = await this.findUnique(where, options, db);

      if (result) {
        const ttl = this.getCacheTTL('findUnique');
        await this.redisService.set(cacheKey, JSON.stringify(result), ttl);
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache error for ${cacheKey}:`, error);
      return this.findUnique(where, options, db);
    }
  }

  /**
   * Cached findMany implementation
   */
  async findManyWithCache(
    options: {
      where?: TWhereInput;
      orderBy?: TOrderByInput | TOrderByInput[];
      select?: TSelectInput;
      include?: TIncludeInput;
    } & (CursorPaginationOptions | OffsetPaginationOptions),
    db?: DatabaseClient
  ): Promise<PaginationResult<TModel>> {
    const params = this.buildCacheParams('findMany', options as unknown as Record<string, unknown>);

    if (!this.shouldCache('findMany', params)) {
      return this.findMany(options, db);
    }

    const cacheKey = this.getCacheKey('findMany', params);

    try {
      // Try to get from cache
      const cachedStr = await this.redisService.get(cacheKey);
      const cached = cachedStr ? (JSON.parse(cachedStr) as SerializableValue) : null;
      if (cached !== null) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return this.deserializePaginationResult(cached);
      }

      // Cache miss - fetch from database
      this.logger.debug(`Cache miss for ${cacheKey}`);
      const result = await this.findMany(options, db);

      const ttl = this.getCacheTTL('findMany');
      await this.redisService.set(
        cacheKey,
        JSON.stringify(this.serializePaginationResult(result)),
        ttl
      );

      return result;
    } catch (error) {
      this.logger.error(`Cache error for ${cacheKey}:`, error);
      return this.findMany(options, db);
    }
  }

  /**
   * Cached count implementation
   */
  async countWithCache(where?: TWhereInput, db?: DatabaseClient): Promise<number> {
    const params = this.buildCacheParams('count', { where });

    if (!this.shouldCache('count', params)) {
      return this.count(where, db);
    }

    const cacheKey = this.getCacheKey('count', params);

    try {
      // Try to get from cache
      const cachedStr = await this.redisService.get(cacheKey);
      const cached = cachedStr ? (JSON.parse(cachedStr) as number) : null;
      if (cached !== null) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Cache miss - fetch from database
      this.logger.debug(`Cache miss for ${cacheKey}`);
      const result = await this.count(where, db);

      const ttl = this.getCacheTTL('count');
      await this.redisService.set(cacheKey, JSON.stringify(result), ttl);

      return result;
    } catch (error) {
      this.logger.error(`Cache error for ${cacheKey}:`, error);
      return this.count(where, db);
    }
  }

  /**
   * Create with cache invalidation
   */
  async createWithCacheInvalidation(
    data: TCreateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel> {
    const result = await this.create(data, options, db);

    // Invalidate related cache patterns
    await this.invalidateRepositoryCache();

    return result;
  }

  /**
   * Update with cache invalidation
   */
  async updateWithCacheInvalidation(
    where: TWhereInput,
    data: TUpdateInput,
    options?: {
      select?: TSelectInput;
      include?: TIncludeInput;
    },
    db?: DatabaseClient
  ): Promise<TModel> {
    const result = await this.update(where, data, options, db);

    // Invalidate related cache patterns
    await this.invalidateRepositoryCache();

    return result;
  }

  /**
   * Delete with cache invalidation
   */
  async deleteWithCacheInvalidation(where: TWhereInput, db?: DatabaseClient): Promise<TModel> {
    const result = await this.delete(where, db);

    // Invalidate related cache patterns
    await this.invalidateRepositoryCache();

    return result;
  }

  /**
   * Invalidate all cache for this repository
   */
  protected async invalidateRepositoryCache(): Promise<void> {
    const repositoryName = this.constructor.name.toLowerCase().replace('repository', '');
    const patterns = [
      CacheKeyBuilder.buildPatternKey('repo', `${repositoryName}:*`),
      CacheKeyBuilder.buildPatternKey('api', '*'), // Invalidate API cache too
    ];

    await this.invalidateCache(patterns);
  }

  /**
   * Build cache parameters from method arguments
   */
  protected buildCacheParams(operation: string, args: Record<string, unknown>): CacheParams {
    // Создаём единый хэш из всех аргументов для компактности
    const argEntries = Object.entries(args)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return `${key}:${String(value).replace(/[^a-zA-Z0-9]/g, '_')}`;
        }
        return `${key}:${this.hashObject(value)}`;
      });

    const argsHash = argEntries.length > 0 ? this.createShortHash(argEntries.join('|')) : 'no_args';

    return { operation, args: argsHash };
  }

  /**
   * Create a simple hash from object
   */
  protected hashObject(obj: unknown): string {
    try {
      const str = JSON.stringify(obj, Object.keys(obj as object).sort());
      return this.createShortHash(str);
    } catch {
      return 'unknown';
    }
  }

  /**
   * Create short hash from string
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
   * Serialize pagination result for cache storage
   */
  protected serializePaginationResult(result: PaginationResult<TModel>): SerializableObject {
    return {
      items: JSON.stringify(result.items),
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasMore,
      total: result.total ?? null,
    };
  }

  /**
   * Deserialize pagination result from cache
   */
  protected deserializePaginationResult(cached: SerializableValue): PaginationResult<TModel> {
    const data = cached as unknown as SerializableObject;

    const totalValue = data['total'];
    const result: PaginationResult<TModel> = {
      items: JSON.parse(data['items'] as string) as TModel[],
      nextCursor: data['nextCursor'] as string | null | undefined,
      hasMore: data['hasMore'] as boolean,
      ...(totalValue !== undefined && { total: totalValue as number }),
    };

    // Приводим undefined к null для совместимости с типом
    if (result.nextCursor === undefined) {
      result.nextCursor = null;
    }

    return result;
  }

  /**
   * Warm up cache for commonly accessed data
   */
  async warmUpCache(): Promise<void> {
    // Implement cache warming logic in child classes
    this.logger.debug(`Cache warm-up completed for ${this.constructor.name}`);
  }
}
