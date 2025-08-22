import { Module } from '@nestjs/common';
import { PrismaService, RedisModule } from '@repo/infrastructure';

import { UsersMicroserviceController } from './users-microservice.controller';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [RedisModule],
  controllers: [UsersController, UsersMicroserviceController],
  providers: [UsersService, UsersRepository, PrismaService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
