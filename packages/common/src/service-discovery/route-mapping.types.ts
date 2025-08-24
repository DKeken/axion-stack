/**
 * Types for dynamic route mapping in service discovery
 */

export interface RoutePattern {
  /** HTTP method */
  method: string;
  /** Path pattern (can include regex) */
  pathPattern: string;
  /** Message pattern to send to microservice */
  messagePattern: string;
  /** Description of the route */
  description?: string;
}

export interface ServiceRouteConfig {
  /** Service name */
  serviceName: string;
  /** Route patterns for this service */
  routes: RoutePattern[];
}

/**
 * Route matching result
 */
export interface RouteMatch {
  messagePattern: string;
  route: RoutePattern;
  pathParams?: Record<string, string>;
}

/**
 * Dynamic route mapper interface
 */
export interface RouteMapper {
  /**
   * Register routes for a service
   */
  registerServiceRoutes(config: ServiceRouteConfig): void;

  /**
   * Find matching route for HTTP request
   */
  findRoute(serviceName: string, path: string, method: string): RouteMatch | null;

  /**
   * Get all registered routes for a service
   */
  getServiceRoutes(serviceName: string): RoutePattern[];

  /**
   * Check if service supports a specific capability
   */
  hasCapability(serviceName: string, capability: string): boolean;
}
