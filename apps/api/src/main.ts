import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { generateOpenApi } from '@ts-rest/open-api';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { validateConfig } from './config/configuration';
import { apiContract } from './contracts';
import { PrismaService } from './infrastructure/database/prisma.service';

console.log('Hello World');

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate configuration early
  const config = validateConfig();
  logger.log(`🚀 Starting application in ${config.NODE_ENV} mode`);

  const app = await NestFactory.create(AppModule, {
    logger:
      config.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
    })
  );

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Note: API versioning disabled - using TS-REST contract paths directly
  // TS-REST manages versioning through contract paths like /api/v1/users

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: config.NODE_ENV === 'production',
      validationError: {
        target: false,
        value: false,
      },
    })
  );

  // Swagger documentation
  if (config.NODE_ENV !== 'production') {
    await setupSwagger(app);
  }

  // Graceful shutdown
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Start server
  const port = config.PORT;
  await app.listen(port, '0.0.0.0');

  logger.log(`✅ Application running on port ${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`💓 Health check: http://localhost:${port}/health`);
}

async function setupSwagger(app: INestApplication) {
  const logger = new Logger('Swagger');

  try {
    // Generate OpenAPI spec from ts-rest contracts
    const openApiDocument = generateOpenApi(
      apiContract,
      {
        info: {
          title: 'API Documentation',
          description: 'Production-ready NestJS API with ts-rest contracts',
          version: '1.0.0',
          contact: {
            name: 'API Support',
            email: 'support@example.com',
          },
        },
        servers: [
          {
            url: 'http://localhost:3001',
            description: 'Development server',
          },
        ],
        tags: [
          {
            name: 'Authentication',
            description: 'User authentication and authorization',
          },
          {
            name: 'Users',
            description: 'User management operations',
          },
        ],
      },
      {
        setOperationId: true,
        jsonQuery: true,
      }
    );

    // Add security schemes
    openApiDocument.components = {
      ...openApiDocument.components,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token',
        },
        refreshToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in httpOnly cookie',
        },
      },
    };

    // Apply security globally (can be overridden per endpoint)
    openApiDocument.security = [
      {
        bearerAuth: [],
      },
    ];

    // Setup Swagger
    SwaggerModule.setup('api/docs', app, openApiDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'API Documentation',
    });

    logger.log('✅ Swagger documentation configured');
  } catch (error) {
    logger.error('❌ Failed to setup Swagger:', error);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application:', error);
  process.exit(1);
});
