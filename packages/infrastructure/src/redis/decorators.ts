/**
 * Simple cache decorators
 */

// For now, these are simple no-op decorators
// You can implement actual caching logic later if needed

/**
 * Cacheable decorator - marks method results for caching
 */
export function Cacheable(_options?: {
  key?: string;
  ttl?: number;
  condition?: string;
}): MethodDecorator {
  return createCacheDecorator();
}

/**
 * Base cache decorator implementation
 */
function createCacheDecorator(): MethodDecorator {
  return (_target: unknown, _propertyName: string | symbol, descriptor: PropertyDescriptor) => {
    // Simple no-op decorator for now
    // Can be enhanced with actual caching logic later
    return descriptor;
  };
}

/**
 * CacheEvict decorator - marks methods that should evict cache
 */
export function CacheEvict(_options?: {
  key?: string;
  allEntries?: boolean;
  beforeInvocation?: boolean;
}): MethodDecorator {
  return createCacheDecorator();
}
