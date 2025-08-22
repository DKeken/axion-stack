import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3003),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).max(15).default(0),
  REDIS_KEY_PREFIX: z.string().default(':'),
  REDIS_TTL: z.coerce.number().min(1).default(3600), // 1 hour default

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_TTL: z.coerce.number().min(1).default(60),
  RATE_LIMIT_LIMIT: z.coerce.number().min(1).default(100),

  // RabbitMQ
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  RABBITMQ_EXCHANGE_NAME: z.string().default('axion.events'),
  RABBITMQ_QUEUE_PREFIX: z.string().default('axion'),
  RABBITMQ_RETRY_ATTEMPTS: z.coerce.number().min(1).max(10).default(3),
  RABBITMQ_RETRY_DELAY: z.coerce.number().min(100).default(1000),
});

export type AppConfig = z.infer<typeof configSchema>;

export function validateConfig(): AppConfig {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    // Log detailed errors only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Configuration validation failed:', errors);
    }
    throw new Error('Configuration validation failed. Check environment variables.');
  }

  return result.data;
}
