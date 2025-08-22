import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { PrismaService } from '@repo/infrastructure';
import cookieParser from 'cookie-parser';

import { AppModule } from '../app.module';
import { validateConfig } from '../config/configuration';

import type { AppConfig } from '../config/configuration';
import type { NestExpressApplication } from '@nestjs/platform-express';

export class AppFactory {
  static async create(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Setup app configuration
    await AppFactory.setupApp(app);

    return app;
  }

  private static async setupApp(app: NestExpressApplication): Promise<void> {
    const configService = app.get(ConfigService<AppConfig>);

    // Validate configuration
    validateConfig();

    // Enable cookie parsing
    app.use(cookieParser());

    // Enable CORS
    const corsOrigin = configService.get('CORS_ORIGIN', { infer: true }) || '*';
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });

    // Setup global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Setup Prisma shutdown hooks
    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);
  }
}
