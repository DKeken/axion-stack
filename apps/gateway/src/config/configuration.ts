import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),

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

  // Microservices URLs
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3003'),

  // RabbitMQ
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  RABBITMQ_EXCHANGE_NAME: z.string().default('gearai.events'),
  RABBITMQ_QUEUE_PREFIX: z.string().default('gearai'),
  RABBITMQ_RETRY_ATTEMPTS: z.coerce.number().min(1).max(10).default(3),
  RABBITMQ_RETRY_DELAY: z.coerce.number().min(100).default(1000),

  // OpenRouter API
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_SITE_NAME: z.string().optional(),

  OPENROUTER_API_TIMEOUT: z.coerce.number().min(1000).default(30000),
  OPENROUTER_RETRY_ATTEMPTS: z.coerce.number().min(1).max(10).default(3),
  OPENROUTER_RETRY_DELAY: z.coerce.number().min(100).default(1000),

  // Models configuration
  MODELS_PRICING_MULTIPLIER: z.coerce.number().min(1).max(10).default(2.0),
  MODELS_SYNC_BATCH_SIZE: z.coerce.number().min(10).max(1000).default(50),
  MODELS_CACHE_TTL: z.coerce.number().min(60).default(300), // 5 minutes
});

export type AppConfig = z.infer<typeof configSchema>;

export function validateConfig(): AppConfig {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    throw new Error(`Configuration validation failed:\n${JSON.stringify(errors, null, 2)}`);
  }

  return result.data;
}
