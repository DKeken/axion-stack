import { Controller, Get } from '@nestjs/common';
import { Public } from '@repo/common';

import { HealthRabbitMQService } from './health-rabbitmq.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthRabbitMQService: HealthRabbitMQService) {}

  @Get()
  @Public()
  async check() {
    const checks: Record<string, { status: 'up' | 'down'; error?: string; details?: unknown }> = {};

    // Check microservices health via RabbitMQ
    try {
      const serviceHealths = await this.healthRabbitMQService.checkAllServices(5000);

      serviceHealths.forEach((serviceHealth) => {
        checks[`${serviceHealth.service}-service`] = {
          status: serviceHealth.status === 'ok' ? 'up' : 'down',
          error: serviceHealth.error,
          details: {
            responseTime: serviceHealth.responseTime,
            checks: serviceHealth.data?.checks,
            uptime: serviceHealth.data?.uptime,
          },
        };
      });
    } catch (error) {
      checks.microservices = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Failed to check microservices',
      };
    }

    const allUp = Object.values(checks).every((check) => check.status === 'up');

    return {
      status: allUp ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }

  @Get('microservices')
  @Public()
  async checkMicroservices() {
    try {
      const serviceHealths = await this.healthRabbitMQService.checkAllServices(5000);

      return {
        status: serviceHealths.every((s) => s.status === 'ok') ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        services: serviceHealths,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to check microservices',
        services: [],
      };
    }
  }

  @Get('liveness')
  @Public()
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'api-gateway',
    };
  }

  @Get('readiness')
  @Public()
  async readiness() {
    try {
      const serviceHealths = await this.healthRabbitMQService.checkAllServices(3000);
      const serviceChecks: Record<string, string> = {};
      let allReady = true;

      serviceHealths.forEach((serviceHealth) => {
        const serviceName = `${serviceHealth.service}-service`;
        if (serviceHealth.status === 'ok') {
          serviceChecks[serviceName] = 'ready';
        } else if (serviceHealth.status === 'timeout') {
          serviceChecks[serviceName] = 'timeout';
          allReady = false;
        } else {
          serviceChecks[serviceName] = 'not ready';
          allReady = false;
        }
      });

      return {
        status: allReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString(),
        checks: serviceChecks,
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to check readiness',
        checks: {},
      };
    }
  }
}
