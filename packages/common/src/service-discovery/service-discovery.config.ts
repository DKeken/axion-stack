import type { ServiceDiscoveryConfig } from './types';

/**
 * Default Service Discovery Configuration
 * Centralized configuration to avoid duplication across apps
 */
export const DEFAULT_SERVICE_DISCOVERY_CONFIG: ServiceDiscoveryConfig = {
  registryPrefix: 'axion:services',
  heartbeatInterval: 30000, // 30 seconds
  serviceTtl: 120, // 2 minutes in seconds
  enableCleanup: true,
};

/**
 * Factory function for creating service discovery config
 * Allows overriding specific values while keeping defaults
 */
export function createServiceDiscoveryConfig(
  overrides: Partial<ServiceDiscoveryConfig> = {}
): ServiceDiscoveryConfig {
  return {
    ...DEFAULT_SERVICE_DISCOVERY_CONFIG,
    ...overrides,
  };
}
