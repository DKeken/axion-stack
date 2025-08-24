// Core services
export * from './service-registry.service';
export * from './service-registry.module';
export * from './microservice-registry.service';
export * from './dynamic-route-mapper.service';
export * from './contract-discovery.service';

// Configuration
export * from './service-discovery.config';

// Types (only commonly used ones)
export * from './types';

// Internal types (used only within service-discovery)
export type { RoutePattern, ServiceRouteConfig, RouteMatch } from './route-mapping.types';
