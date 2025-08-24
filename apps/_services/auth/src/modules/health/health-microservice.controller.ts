import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { HealthMicroserviceService } from './health-microservice.service';

import type { HealthCheckRequest, HealthCheckResponse } from '@repo/common';
import type { MicroserviceResponse } from '@repo/common/types';

@Controller()
export class HealthMicroserviceController {
  private readonly logger = new Logger(HealthMicroserviceController.name);

  constructor(private readonly healthService: HealthMicroserviceService) {}

  @MessagePattern('health.check')
  async healthCheck(
    @Payload() request: HealthCheckRequest
  ): Promise<MicroserviceResponse<HealthCheckResponse>> {
    try {
      this.logger.debug('Processing health.check request');

      const result = await this.healthService.checkHealth(request);

      return {
        status: result.status === 'ok' ? 200 : 503,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in health.check:', error);
      return {
        status: 503,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }
}
