import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:password@localhost:5672'],
      queue: 'user_service_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  });

  // Start both HTTP server and microservice
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);

  if (process.env.NODE_ENV === 'development') {
    console.log(`User Service is running on: ${await app.getUrl()}`);
  }
}

bootstrap().catch((error) => {
  console.error('Error starting User Service:', error);
  process.exit(1);
});
