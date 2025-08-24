import { Module } from '@nestjs/common';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { HealthMicroserviceController } from './health-microservice.controller';
import { HealthMicroserviceService } from './health-microservice.service';

@Module({
  imports: [RedisModule],
  controllers: [HealthMicroserviceController],
  providers: [PrismaService, HealthMicroserviceService],
})
export class HealthModule {
  // Module configuration is handled by decorators above
}
