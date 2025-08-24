import { Injectable, Logger } from '@nestjs/common';

import type {
  RouteMapper,
  RouteMatch,
  RoutePattern,
  ServiceRouteConfig,
} from './route-mapping.types';

@Injectable()
export class DynamicRouteMapperService implements RouteMapper {
  private readonly logger = new Logger(DynamicRouteMapperService.name);
  private serviceRoutes = new Map<string, RoutePattern[]>();
  private serviceCapabilities = new Map<string, Set<string>>();

  /**
   * Register routes for a service
   */
  registerServiceRoutes(config: ServiceRouteConfig): void {
    this.serviceRoutes.set(config.serviceName, config.routes);

    // Extract capabilities from routes
    const capabilities = new Set(config.routes.map((route) => route.messagePattern));
    this.serviceCapabilities.set(config.serviceName, capabilities);

    this.logger.log(
      `📋 Registered ${config.routes.length} routes for service '${config.serviceName}': [${Array.from(
        capabilities
      ).join(', ')}]`
    );

    // Log actual route patterns for debugging
    config.routes.forEach((route) => {
      this.logger.debug(`   ${route.method} ${route.pathPattern} -> ${route.messagePattern}`);
    });
  }

  /**
   * Find matching route for HTTP request
   */
  findRoute(serviceName: string, path: string, method: string): RouteMatch | null {
    const routes = this.serviceRoutes.get(serviceName);
    if (!routes) {
      this.logger.warn(`No routes registered for service: ${serviceName}`);
      this.logger.debug(
        `Available services: [${Array.from(this.serviceRoutes.keys()).join(', ')}]`
      );
      return null;
    }

    this.logger.debug(
      `Looking for: ${method} ${path} in service '${serviceName}' (${routes.length} routes available)`
    );
    routes.forEach((route) => {
      this.logger.debug(`  Checking: ${route.method} ${route.pathPattern}`);
    });

    for (const route of routes) {
      if (route.method.toLowerCase() !== method.toLowerCase()) {
        continue;
      }

      const match = this.matchPath(route.pathPattern, path);
      if (match.matches) {
        this.logger.debug(
          `Route match: ${method} ${path} -> ${route.messagePattern} (service: ${serviceName})`
        );

        return {
          messagePattern: route.messagePattern,
          route,
          pathParams: match.params,
        };
      }
    }

    this.logger.debug(`No route match found for: ${method} ${path} (service: ${serviceName})`);
    return null;
  }

  /**
   * Get all registered routes for a service
   */
  getServiceRoutes(serviceName: string): RoutePattern[] {
    return this.serviceRoutes.get(serviceName) || [];
  }

  /**
   * Check if service supports a specific capability
   */
  hasCapability(serviceName: string, capability: string): boolean {
    const capabilities = this.serviceCapabilities.get(serviceName);
    return capabilities?.has(capability) || false;
  }

  /**
   * Update service capabilities from service discovery
   */
  updateServiceCapabilities(serviceName: string, capabilities: string[]): void {
    this.serviceCapabilities.set(serviceName, new Set(capabilities));
    this.logger.debug(`Updated capabilities for ${serviceName}: [${capabilities.join(', ')}]`);
  }

  /**
   * Remove service routes and capabilities
   */
  removeService(serviceName: string): void {
    this.serviceRoutes.delete(serviceName);
    this.serviceCapabilities.delete(serviceName);
    this.logger.debug(`Removed routes for service: ${serviceName}`);
  }

  /**
   * Match path pattern against actual path
   */
  private matchPath(
    pattern: string,
    path: string
  ): { matches: boolean; params?: Record<string, string> } {
    // Handle exact matches first
    if (pattern === path) {
      return { matches: true };
    }

    // Handle parameter patterns like "/users/:id"
    if (pattern.includes(':')) {
      const paramNames: string[] = [];
      const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });

      const regex = new RegExp(`^${regexPattern}$`);
      const match = path.match(regex);

      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((paramName, index) => {
          params[paramName] = match[index + 1];
        });

        return { matches: true, params };
      }
    }

    // Handle regex patterns
    if (pattern.startsWith('/') && pattern.includes('(')) {
      try {
        const regex = new RegExp(`^${pattern}$`);
        const match = path.match(regex);
        return { matches: Boolean(match) };
      } catch (_error) {
        this.logger.warn(`Invalid regex pattern: ${pattern}`);
        return { matches: false };
      }
    }

    return { matches: false };
  }
}
