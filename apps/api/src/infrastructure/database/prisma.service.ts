/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  type INestApplication,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@repo/database';

import type { AppConfig } from '@/config/configuration';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    const isProduction = configService.get('NODE_ENV', { infer: true }) === 'production';

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: isProduction
        ? [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
          ],
    });

    if (!isProduction) {
      // Log queries in development
      this.$on('query', (e) => {
        this.logger.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
      });
    }

    this.$on('error', (e) => {
      this.logger.error('Prisma error:', e);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('✅ Disconnected from database');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from database:', error);
    }
  }

  /**
   * Enable shutdown hooks for graceful shutdown
   */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // beforeExit is not a log event, it needs different handling
    // For graceful shutdown, use process signals instead
    const gracefulShutdown = async () => {
      await app.close();
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }
}
