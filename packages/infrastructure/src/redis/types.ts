/**
 * Redis types
 */

// Serializable value types for Redis storage
export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | Date
  | { [key: string]: SerializableValue }
  | SerializableValue[];

// Object type for Redis storage - plain objects with serializable values
export type SerializableObject = Record<string, SerializableValue>;

// Session data interface
export interface SessionData {
  readonly userId: string;
  readonly sessionId: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

// Cache parameters
export interface CacheParams {
  operation: string;
  args: string;
  ttl?: number;
  keyPrefix?: string;
  version?: string;
}

// Cache key builder utility with improved structure

export class CacheKeyBuilder {
  private static readonly SEPARATOR = ':';
  private static readonly NAMESPACE_SEPARATOR = '@';

  // Private constructor to prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Builds a structured cache key
   * Format: prefix:part1:part2:...
   */
  static buildKey(...parts: (string | number)[]): string {
    return parts
      .filter((part) => part !== null && part !== undefined && part !== '')
      .map((part) => String(part).replace(/[:\s@]/g, '_')) // Sanitize special characters
      .join(CacheKeyBuilder.SEPARATOR);
  }

  /**
   * Builds a pattern key for cache invalidation
   * Format: prefix:pattern
   */
  static buildPatternKey(prefix: string, pattern: string): string {
    return `${CacheKeyBuilder.sanitize(prefix)}${CacheKeyBuilder.SEPARATOR}${pattern}`;
  }

  /**
   * Builds an API cache key with namespace
   * Format: api@module:operation:params
   */
  static buildApiKey(module: string, operation: string, ...params: (string | number)[]): string {
    const namespace = `api${CacheKeyBuilder.NAMESPACE_SEPARATOR}${CacheKeyBuilder.sanitize(module)}`;
    return CacheKeyBuilder.buildKey(namespace, CacheKeyBuilder.sanitize(operation), ...params);
  }

  /**
   * Builds a repository cache key with namespace
   * Format: repo@entity:operation:params
   */
  static buildRepoKey(entity: string, operation: string, ...params: (string | number)[]): string {
    const namespace = `repo${CacheKeyBuilder.NAMESPACE_SEPARATOR}${CacheKeyBuilder.sanitize(entity)}`;
    return CacheKeyBuilder.buildKey(namespace, CacheKeyBuilder.sanitize(operation), ...params);
  }

  /**
   * Builds a session cache key
   * Format: session:userId:sessionId
   */
  static buildSessionKey(userId: string, sessionId?: string): string {
    return sessionId
      ? CacheKeyBuilder.buildKey(
          'session',
          CacheKeyBuilder.sanitize(userId),
          CacheKeyBuilder.sanitize(sessionId)
        )
      : CacheKeyBuilder.buildKey('session', CacheKeyBuilder.sanitize(userId));
  }

  /**
   * Builds a user-specific cache key
   * Format: user:userId:resource:params
   */
  static buildUserKey(userId: string, resource: string, ...params: (string | number)[]): string {
    return CacheKeyBuilder.buildKey(
      'user',
      CacheKeyBuilder.sanitize(userId),
      CacheKeyBuilder.sanitize(resource),
      ...params
    );
  }

  /**
   * Extract namespace from cache key
   */
  static extractNamespace(key: string): string | null {
    const namespaceIndex = key.indexOf(CacheKeyBuilder.NAMESPACE_SEPARATOR);
    if (namespaceIndex === -1) return null;

    const separatorIndex = key.indexOf(CacheKeyBuilder.SEPARATOR);
    if (separatorIndex === -1 || separatorIndex < namespaceIndex) return null;

    return key.substring(0, separatorIndex);
  }

  /**
   * Extract module/entity from namespaced key
   */
  static extractModule(key: string): string | null {
    const namespace = CacheKeyBuilder.extractNamespace(key);
    if (!namespace) return null;

    const parts = namespace.split(CacheKeyBuilder.NAMESPACE_SEPARATOR);
    return parts.length > 1 ? (parts[1] ?? null) : null;
  }

  /**
   * Sanitize key part to ensure valid Redis key
   */
  private static sanitize(part: string | number): string {
    return String(part)
      .replace(/[:\s@]/g, '_')
      .replace(/[^\w\-_.]/g, '')
      .toLowerCase();
  }
}

// Cacheable repository interface
export interface ICacheableRepository {
  clearCache(key?: string): Promise<void>;
  setCacheParams(params: CacheParams): void;
}
