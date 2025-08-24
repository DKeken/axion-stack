import { Injectable, Logger } from '@nestjs/common';

import type {
  HealthCheckConfig,
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckStatus,
} from './types';

/**
 * Base health check service for microservices
 */
@Injectable()
export abstract class BaseHealthService {
  protected readonly logger = new Logger(this.constructor.name);
  private startTime = Date.now();

  constructor(protected readonly config: HealthCheckConfig) {}

  /**
   * Perform health check for all configured dependencies
   */
  async checkHealth(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    this.logger.debug(`Starting health check for service: ${this.config.serviceName}`);

    const checks: Record<string, HealthCheckStatus> = {};

    // Check all dependencies
    await Promise.all(
      this.config.dependencies.map(async (dependency) => {
        const checkStart = Date.now();
        try {
          const result = await this.executeWithTimeout(
            dependency.check(),
            request.timeout ?? this.config.defaultTimeout ?? 5000
          );

          checks[dependency.name] = {
            ...result,
            latency: Date.now() - checkStart,
          };
        } catch (error) {
          checks[dependency.name] = {
            status: 'down',
            error: error instanceof Error ? error.message : 'Unknown error',
            latency: Date.now() - checkStart,
          };
        }
      })
    );

    // Determine overall status
    const allUp = Object.values(checks).every((check) => check.status === 'up');

    const response: HealthCheckResponse = {
      status: allUp ? 'ok' : 'error',
      service: this.config.serviceName,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
      responseTime: Date.now() - startTime,
    };

    this.logger.debug(
      `Health check completed for ${this.config.serviceName}: ${response.status} (${response.responseTime}ms)`
    );

    return response;
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Health check timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Get service uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}
