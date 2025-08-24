import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResponseUtils, JwtValidationService } from '@repo/common';
import { firstValueFrom, timeout } from 'rxjs';

import { MetricsService } from '../metrics/metrics.service';
import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';

import type { AppConfig } from '@/config/configuration';
import type { MicroserviceRequest, MicroserviceResponse } from '@repo/common/types';
import type { Request, Response } from 'express';

@Injectable()
export class GatewayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly jwtValidationService: JwtValidationService,
    private readonly serviceDiscovery: ServiceDiscoveryService,
    private readonly metricsService: MetricsService
  ) {}

  async onModuleInit(): Promise<void> {
    // Service discovery handles client connections
    this.logger.log('🌐 Gateway service initialized with dynamic service discovery');
  }

  async proxyToService(serviceName: string, req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const apiPrefix = this.configService.get('API_PREFIX', { infer: true });

      // Remove the API prefix and service name from the path
      let servicePath = req.path.replace(`${apiPrefix}/${serviceName}`, '');

      // Handle the case where we have exact match (e.g., /api/v1/users -> '')
      if (!servicePath) {
        servicePath = '/';
      }

      // Prepare headers (exclude sensitive/internal headers)
      const headers: Record<string, string> = {};
      Object.entries(req.headers).forEach(([key, value]) => {
        if (
          key !== 'host' &&
          key !== 'content-length' &&
          key !== 'connection' &&
          key !== 'content-encoding' &&
          typeof value === 'string'
        ) {
          headers[key] = value;
        }
      });

      // Extract user context from tokens for microservice requests
      const user = await this.jwtValidationService.extractUserFromRequest(req).catch(() => null);

      // Create microservice request
      const microserviceRequest: MicroserviceRequest = {
        method: req.method,
        path: servicePath,
        query: req.query as Record<string, unknown>,
        headers,
        body: req.body,
        user: user ?? undefined,
      };

      const client = this.serviceDiscovery.getClient(serviceName);

      if (!client) {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.recordMicroserviceRequest(
          serviceName,
          req.method,
          'unavailable',
          duration
        );

        res.status(503).json({
          error: 'Service unavailable',
          message: `Service '${serviceName}' is not available or not registered`,
          availableServices: this.serviceDiscovery.getAvailableServices(),
        });
        return;
      }

      // Route to appropriate message pattern using dynamic routing
      const routeMatch = this.serviceDiscovery.findRoute(serviceName, servicePath, req.method);

      if (!routeMatch) {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.recordMicroserviceRequest(
          serviceName,
          req.method,
          'not_found',
          duration
        );

        const availableRoutes =
          this.serviceDiscovery.getServiceInfo(serviceName)?.capabilities || [];

        res.status(404).json({
          error: 'Endpoint not found',
          message: `No route found for ${req.method} ${servicePath} in service '${serviceName}'`,
          availableCapabilities: availableRoutes,
        });
        return;
      }

      // Add path parameters to request if any
      if (routeMatch.pathParams) {
        microserviceRequest.pathParams = routeMatch.pathParams;
      }

      // Send message to microservice with timeout
      const response: MicroserviceResponse = await firstValueFrom(
        client.send<MicroserviceResponse>(routeMatch.messagePattern, microserviceRequest).pipe(
          timeout(30000) // 30 seconds timeout
        )
      );

      // Handle microservice response
      const duration = (Date.now() - startTime) / 1000;

      if (response.error) {
        this.metricsService.recordMicroserviceRequest(serviceName, req.method, 'error', duration);

        // Clear auth cookies on auth failures
        AuthResponseUtils.handleErrorCookies(
          serviceName,
          servicePath,
          req.method,
          response.status,
          res
        );
        res.status(response.status || 500).json({ error: response.error });
      } else {
        this.metricsService.recordMicroserviceRequest(serviceName, req.method, 'success', duration);
        // Handle authentication cookies for auth endpoints
        if (serviceName === 'auth') {
          const shouldSet = AuthResponseUtils.shouldSetAuthCookies(
            servicePath,
            req.method,
            response.status
          );

          if (shouldSet && response.data) {
            AuthResponseUtils.handleAuthCookies(response.data, res);
          }
          AuthResponseUtils.handleLogoutCookies(servicePath, req.method, response.status, res);
        }

        res.status(response.status || 200).json(response.data || response);
      }
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      this.logger.error(`Error in gateway for service ${serviceName}:`, error);

      if (!res.headersSent) {
        if (error instanceof Error && error.message.includes('Timeout')) {
          this.metricsService.recordMicroserviceRequest(
            serviceName,
            req.method,
            'timeout',
            duration
          );
          res.status(504).json({
            error: 'Gateway Timeout',
            message: `Request to ${serviceName} service timed out`,
          });
        } else {
          this.metricsService.recordMicroserviceRequest(
            serviceName,
            req.method,
            'gateway_error',
            duration
          );
          res.status(502).json({
            error: 'Bad Gateway',
            message: `Failed to process request to ${serviceName} service`,
          });
        }
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    // Service discovery handles cleanup
    this.logger.log('🔴 Gateway service shutting down');
  }
}
