import type { HealthCheckDependency, HealthCheckStatus } from './types';
import type { PrismaService, RedisService } from '@repo/infrastructure';

/**
 * Common health check implementations for dependencies
 */
export class HealthChecks {
  /**
   * Create database health check dependency
   */
  static database(prisma: PrismaService): HealthCheckDependency {
    return {
      name: 'database',
      check: async (): Promise<HealthCheckStatus> => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return { status: 'up' };
        } catch (error) {
          return {
            status: 'down',
            error: error instanceof Error ? error.message : 'Database connection failed',
          };
        }
      },
    };
  }

  /**
   * Create Redis health check dependency
   */
  static redis(redisService: RedisService): HealthCheckDependency {
    return {
      name: 'redis',
      check: async (): Promise<HealthCheckStatus> => {
        try {
          const start = Date.now();
          await redisService.ping();
          const latency = Date.now() - start;

          return {
            status: 'up',
            details: { latency },
          };
        } catch (error) {
          return {
            status: 'down',
            error: error instanceof Error ? error.message : 'Redis connection failed',
          };
        }
      },
    };
  }

  /**
   * Create RabbitMQ health check dependency
   * This checks if the microservice can receive messages
   */
  static rabbitmq(): HealthCheckDependency {
    return {
      name: 'rabbitmq',
      check: async (): Promise<HealthCheckStatus> => {
        // If we reached this point, RabbitMQ is working
        // because this health check itself is received via RabbitMQ
        return {
          status: 'up',
          details: { message: 'RabbitMQ connection is active (health check received)' },
        };
      },
    };
  }

  /**
   * Create custom health check dependency
   */
  static custom(
    name: string,
    checkFunction: () => Promise<HealthCheckStatus>
  ): HealthCheckDependency {
    return {
      name,
      check: checkFunction,
    };
  }
}
