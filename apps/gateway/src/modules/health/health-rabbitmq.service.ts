import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';

import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';

import type { HealthCheckRequest, HealthCheckResponse } from '@repo/common';
import type { MicroserviceResponse } from '@repo/common/types';

interface ServiceHealthStatus {
  service: string;
  status: 'ok' | 'error' | 'timeout';
  data?: HealthCheckResponse;
  error?: string;
  responseTime: number;
}

@Injectable()
export class HealthRabbitMQService {
  private readonly logger = new Logger(HealthRabbitMQService.name);

  constructor(private readonly serviceDiscovery: ServiceDiscoveryService) {}

  // Removed onModuleInit - using service discovery

  async checkServiceHealth(serviceName: string, timeoutMs = 5000): Promise<ServiceHealthStatus> {
    const startTime = Date.now();

    try {
      const client = this.serviceDiscovery.getClient(serviceName);
      if (!client) {
        return {
          service: serviceName,
          status: 'error',
          error: 'Service not available in service discovery',
          responseTime: Date.now() - startTime,
        };
      }

      const healthRequest: HealthCheckRequest = {
        timestamp: new Date().toISOString(),
        timeout: timeoutMs,
      };

      const response: MicroserviceResponse<HealthCheckResponse> = await firstValueFrom(
        client
          .send<MicroserviceResponse<HealthCheckResponse>>('health.check', healthRequest)
          .pipe(timeout(timeoutMs))
      );

      const responseTime = Date.now() - startTime;

      if (response.error) {
        return {
          service: serviceName,
          status: 'error',
          error: response.error,
          responseTime,
        };
      }

      return {
        service: serviceName,
        status: response.data?.status === 'ok' ? 'ok' : 'error',
        data: response.data,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && error.message.includes('Timeout')) {
        return {
          service: serviceName,
          status: 'timeout',
          error: `Health check timeout after ${timeoutMs}ms`,
          responseTime,
        };
      }

      return {
        service: serviceName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  }

  async checkAllServices(timeoutMs = 5000): Promise<ServiceHealthStatus[]> {
    const services = this.serviceDiscovery.getAvailableServices();

    if (services.length === 0) {
      this.logger.warn('No services available in service discovery');
      return [];
    }

    this.logger.debug(`Starting health check for services: [${services.join(', ')}] via RabbitMQ`);

    const results = await Promise.all(
      services.map((service) => this.checkServiceHealth(service, timeoutMs))
    );

    this.logger.debug(
      `Completed health check for all services. Results: ${results
        .map((r) => `${r.service}:${r.status}`)
        .join(', ')}`
    );

    return results;
  }

  // Removed getClientForService and onModuleDestroy - using service discovery
}
