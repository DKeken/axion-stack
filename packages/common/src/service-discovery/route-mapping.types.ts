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
