import { Controller, Get, Header, UnauthorizedException, Req } from '@nestjs/common';
import { register } from 'prom-client';

import type { Request } from 'express';

/**
 * Protected metrics endpoint for Prometheus scraping
 */
@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(@Req() request: Request): Promise<string> {
    const authHeader = request.headers.authorization;
    const expectedToken = process.env.METRICS_AUTH_TOKEN || 'metrics-secret-token';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost =
      request.ip === '::ffff:127.0.0.1' || request.ip === '127.0.0.1' || request.ip === '::1';

    const isDockerNetwork =
      request.ip?.startsWith('172.') || request.ip?.startsWith('10.') || isLocalhost;
    const hasValidAuth = authHeader === `Bearer ${expectedToken}`;

    // Production: require auth, Development: allow localhost without auth
    if (!isDevelopment || (!isLocalhost && !isDockerNetwork)) {
      if (!hasValidAuth) {
        throw new UnauthorizedException('Invalid or missing metrics authorization token');
      }
    }

    return register.metrics();
  }
}
