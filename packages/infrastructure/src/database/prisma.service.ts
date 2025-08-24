/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  type INestApplication,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Prisma, PrismaClient } from '@repo/database';

// Global reference for development mode to prevent connection leaks during HMR
declare global {
  var __prisma: PrismaClient | undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private get isProduction(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) === 'production';
  }

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    const isProduction = configService.get('NODE_ENV', { infer: true }) === 'production';

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in the environment variables');
    }

    super({
      datasources: {
        db: {
          url: databaseUrl as string,
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

    // Setup error handling
    this.$on('error', (e) => {
      this.logger.error('Prisma error:', e);
    });

    // Development-specific setup
    if (!isProduction) {
      // Log queries in development (without sensitive parameters)
      this.$on('query', (e) => {
        this.logger.debug(`Query executed -- Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit(): Promise<void> {
    // Retry logic for robust connection (inspired by production hardening best practices)
    // Ref: Hardening Prisma for Production (retry + graceful shutdown)
    const maxRetries = parseInt(process.env['DB_CONNECT_RETRIES'] ?? '3', 10);
    const retryDelayMs = parseInt(process.env['DB_CONNECT_DELAY_MS'] ?? '2000', 10);

    // In development, store global reference to prevent connection leaks
    if (!this.isProduction) {
      if (globalThis.__prisma) {
        this.logger.log('♻️ Reusing existing Prisma connection (HMR)');
        return;
      }
      globalThis.__prisma = this;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.$connect();
        this.logger.log('✅ Connected to database');
        return;
      } catch (error) {
        const left = maxRetries - attempt;
        this.logger.warn(
          `⚠️ Database connection failed (attempt ${attempt}/${maxRetries}). ${left > 0 ? `Retrying in ${retryDelayMs}ms...` : 'No retries left.'}`
        );
        if (left === 0) {
          this.logger.error('❌ Failed to connect to database:', error);
          throw error;
        }
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      // In production, always disconnect
      if (this.isProduction) {
        await this.$disconnect();
        this.logger.log('✅ Disconnected from database');
      } else {
        // In development, keep connection alive for HMR
        this.logger.log('🔄 Keeping database connection alive for HMR');
      }
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from database:', error);
    }
  }

  /**
   * Enable shutdown hooks for graceful shutdown
   */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    const gracefulShutdown = async (signal: string) => {
      this.logger.log(`🛑 Received ${signal}, shutting down gracefully...`);

      try {
        // Always disconnect on shutdown
        await this.$disconnect();
        if (!this.isProduction) {
          globalThis.__prisma = undefined;
        }
        await app.close();
        this.logger.log('✅ Application shut down gracefully');
        process.exit(0);
      } catch (error) {
        this.logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}
