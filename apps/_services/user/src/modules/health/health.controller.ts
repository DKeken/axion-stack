import { Controller, Get } from '@nestjs/common';
import { Public } from '@repo/common';
import { PrismaService, RedisService } from '@repo/infrastructure';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  @Get()
  @Public()
  async check() {
    const checks: Record<string, { status: 'up' | 'down'; error?: string; details?: unknown }> = {};

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

    // Redis health check
    try {
      const start = Date.now();
      await this.redisService.ping();
      const latency = Date.now() - start;

      checks.redis = {
        status: 'up',
        details: { latency },
      };
    } catch (error) {
      checks.redis = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Redis connection failed',
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
