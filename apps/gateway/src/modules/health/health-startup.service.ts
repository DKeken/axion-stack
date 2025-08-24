import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';

import { HealthRabbitMQService } from './health-rabbitmq.service';

import type { AppConfig } from '@/config/configuration';

interface ServiceHealthResult {
  service: string;
  status: 'ok' | 'error' | 'timeout';
  responseTime: number;
  error?: string;
  data?: {
    checks?: Record<
      string,
      {
        status: string;
        latency?: number;
      }
    >;
  };
}

@Injectable()
export class HealthStartupService implements OnModuleInit {
  private readonly logger = new Logger(HealthStartupService.name);

  constructor(
    private readonly serviceDiscovery: ServiceDiscoveryService,
    private readonly healthRabbitMQService: HealthRabbitMQService,
    private readonly configService: ConfigService<AppConfig>
  ) {}

  async onModuleInit(): Promise<void> {
    const enableStartupHealthCheck = this.configService.get('NODE_ENV') !== 'test';

    if (!enableStartupHealthCheck) {
      this.logger.log('Startup health checks disabled in test environment');
      return;
    }

    const criticalServices = ['auth']; // Services critical for gateway operation
    const maxWaitTime = this.configService.get('NODE_ENV') === 'production' ? 60000 : 20000; // 60s prod, 20s dev
    const pollInterval = 3000; // Check every 3 seconds (reduced frequency)

    this.logger.log('Waiting for microservices to register with service discovery...');

    try {
      // Wait for critical services to be discovered
      const discoveredServices = await this.waitForServiceDiscovery(
        criticalServices,
        maxWaitTime,
        pollInterval
      );

      if (discoveredServices.length === 0) {
        this.logger.warn(`No services discovered within ${maxWaitTime}ms timeout`);
        return;
      }

      this.logger.log(
        `Found ${discoveredServices.length} services: [${discoveredServices.join(', ')}]`
      );

      // Now perform health checks on discovered services
      this.logger.log('Starting health checks for discovered microservices...');
      const results = await this.healthRabbitMQService.checkAllServices(10000);

      void this.processHealthResults(results, criticalServices);
    } catch (error) {
      this.logger.error('Failed to perform startup health checks:', error);
      this.logger.warn('Gateway will continue startup, but microservices may not be ready');
    }
  }

  /**
   * Wait for services to be discovered by service discovery
   */
  private async waitForServiceDiscovery(
    requiredServices: string[],
    maxWaitTime: number,
    pollInterval: number
  ): Promise<string[]> {
    const startTime = Date.now();
    let attempt = 0;

    while (Date.now() - startTime < maxWaitTime) {
      attempt++;

      try {
        // Force discovery on every attempt to ensure fresh data
        const serviceNames = await this.serviceDiscovery.forceDiscovery();

        this.logger.debug(`[Attempt ${attempt}] Available services: [${serviceNames.join(', ')}]`);

        // Check if all critical services are available
        const missingCritical = requiredServices.filter(
          (service) => !serviceNames.includes(service)
        );

        if (missingCritical.length === 0) {
          this.logger.log(`All critical services discovered: [${requiredServices.join(', ')}]`);
          return serviceNames;
        }

        if (serviceNames.length > 0) {
          this.logger.debug(
            `Partial discovery: missing critical services [${missingCritical.join(', ')}]`
          );
        } else {
          this.logger.debug('No services discovered yet, continuing to wait...');
        }
      } catch (error) {
        this.logger.debug(`Service discovery attempt ${attempt} failed:`, error);
      }

      // Wait before next attempt
      await this.delay(pollInterval);
    }

    // Timeout reached, get whatever services are available
    try {
      const serviceNames = await this.serviceDiscovery.forceDiscovery();

      if (serviceNames.length > 0) {
        this.logger.warn(
          `Timeout reached, proceeding with available services: [${serviceNames.join(', ')}]`
        );
        return serviceNames;
      }
    } catch (error) {
      this.logger.error('Final service discovery attempt failed:', error);
    }

    return [];
  }

  /**
   * Process health check results and provide detailed logging
   */
  private async processHealthResults(
    results: ServiceHealthResult[],
    criticalServices: string[]
  ): Promise<void> {
    let allHealthy = true;
    let criticalServicesHealthy = true;

    for (const result of results) {
      const isCritical = criticalServices.includes(result.service);

      if (result.status === 'ok') {
        this.logger.log(
          `${result.service}-service: HEALTHY (${result.responseTime}ms)${isCritical ? ' [CRITICAL]' : ''}`
        );

        if (result.data?.checks) {
          Object.entries(result.data.checks).forEach(
            ([check, status]: [string, { status: string; latency?: number }]) => {
              const icon = status.status === 'up' ? '✅' : '❌';
              const latency = status.latency ? ` (${status.latency}ms)` : '';
              this.logger.log(`   ${icon} ${check}: ${status.status}${latency}`);
            }
          );
        }
      } else {
        allHealthy = false;
        if (isCritical) {
          criticalServicesHealthy = false;
        }

        const level = isCritical ? 'error' : 'warn';
        const criticalLabel = isCritical ? ' [CRITICAL]' : '';

        this.logger[level](
          `${result.service}-service: ${result.status.toUpperCase()} (${result.responseTime}ms)${criticalLabel}`
        );

        if (result.error) {
          this.logger[level](`   Error: ${result.error}`);
        }
      }
    }

    // Summary logging
    const healthyServices = results.filter((r) => r.status === 'ok').length;
    const totalServices = results.length;

    if (allHealthy) {
      this.logger.log('All microservices are healthy and ready!');
    } else if (criticalServicesHealthy) {
      this.logger.warn(
        'Some non-critical microservices have health issues, but gateway can operate'
      );
    } else {
      this.logger.error(
        'Critical microservices are unhealthy! Gateway functionality may be limited'
      );
    }

    this.logger.log(`Health Summary: ${healthyServices}/${totalServices} services healthy`);

    // In production, log critical service issues
    if (this.configService.get('NODE_ENV') === 'production' && !criticalServicesHealthy) {
      this.logger.error(
        'Critical services are down in production. Consider investigating before proceeding.'
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
