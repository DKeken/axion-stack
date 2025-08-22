import { Module } from '@nestjs/common';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { HealthController } from './health.controller';

@Module({
  imports: [RedisModule],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
