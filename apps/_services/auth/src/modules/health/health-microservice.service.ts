import { Injectable } from '@nestjs/common';
import { BaseHealthService, HealthChecks, type HealthCheckConfig } from '@repo/common';
import { PrismaService, RedisService } from '@repo/infrastructure';

@Injectable()
export class HealthMicroserviceService extends BaseHealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {
    const config: HealthCheckConfig = {
      serviceName: 'auth-service',
      dependencies: [
        HealthChecks.database(prisma),
        HealthChecks.redis(redisService),
        HealthChecks.rabbitmq(),
      ],
      defaultTimeout: 5000,
    };

    super(config);
  }
}
