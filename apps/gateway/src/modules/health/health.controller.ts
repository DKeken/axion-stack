import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '@repo/common';
import fetch from 'node-fetch';

import type { AppConfig } from '@/config/configuration';

@Controller('health')
export class HealthController {
  private readonly serviceUrls: Record<string, string>;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.serviceUrls = {
      'auth-service': this.configService.get('AUTH_SERVICE_URL') ?? 'http://localhost:3002',
      'user-service': this.configService.get('USER_SERVICE_URL') ?? 'http://localhost:3003',
    };
  }

  @Get()
  @Public()
  async check() {
    const checks: Record<string, { status: 'up' | 'down'; error?: string; details?: unknown }> = {};

    // Check microservices health
    for (const [serviceName, serviceUrl] of Object.entries(this.serviceUrls)) {
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${serviceUrl}/health/liveness`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - start;

        if (response.ok) {
          checks[serviceName] = {
            status: 'up',
            details: { latency, url: serviceUrl },
          };
        } else {
          checks[serviceName] = {
            status: 'down',
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } catch (error) {
        checks[serviceName] = {
          status: 'down',
          error: error instanceof Error ? error.message : 'Service unreachable',
        };
      }
    }

    const allUp = Object.values(checks).every((check) => check.status === 'up');

    return {
      status: allUp ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
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
    const serviceChecks: Record<string, string> = {};
    let allReady = true;

    // Check if all microservices are ready
    for (const [serviceName, serviceUrl] of Object.entries(this.serviceUrls)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${serviceUrl}/health/liveness`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          serviceChecks[serviceName] = 'ready';
        } else {
          serviceChecks[serviceName] = 'not ready';
          allReady = false;
        }
      } catch {
        serviceChecks[serviceName] = 'unreachable';
        allReady = false;
      }
    }

    return {
      status: allReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: serviceChecks,
    };
  }
}
