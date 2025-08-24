import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

import type { ConfigSchema } from './config/configuration';

async function bootstrap() {
  const configService = new ConfigService<ConfigSchema>();
  const serviceName = configService.get('SERVICE_NAME', { infer: true }) || 'users';
  const queuePrefix = configService.get('RABBITMQ_QUEUE_PREFIX', { infer: true }) ?? 'axion';
  const queueName = `${queuePrefix}.${serviceName}.service`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:password@localhost:5672'],
      queue: queueName,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log(`🚀 User microservice is listening on queue: ${queueName}`);
}

bootstrap().catch((error) => {
  process.exit(1);
});
