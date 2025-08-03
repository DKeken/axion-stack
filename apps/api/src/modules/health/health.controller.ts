import { Controller, Get } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';

import type { IHttpProxyProvider } from '@/infrastructure/http-proxy';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { InjectHttpProxy } from '@/infrastructure/http-proxy';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectHttpProxy() private readonly httpProxy: IHttpProxyProvider
  ) {}

  @Get()
  @Public()
  async check() {
    const checks: Record<string, { status: 'up' | 'down'; error?: string }> = {};

    // Database health check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'up' };
    } catch (error) {
      checks.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // HTTP Proxy health check (if enabled)
    try {
      const isHealthy = await this.httpProxy.healthCheck();
      checks['http-proxy'] = { status: isHealthy ? 'up' : 'down' };
    } catch (error) {
      checks['http-proxy'] = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
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

  @Get('liveness')
  @Public()
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('readiness')
  @Public()
  async readiness() {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
