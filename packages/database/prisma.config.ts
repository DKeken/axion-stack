import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import type { PrismaConfig } from 'prisma';

// Load environment variables manually because Prisma skips implicit .env loading when using prisma.config.ts
// 1) Try package-local .env
loadEnv({ path: path.resolve(process.cwd(), '.env') });
// 2) Fallback to monorepo root .env (../../ from packages/database)
loadEnv({ path: path.resolve(process.cwd(), '../../.env') });

export default {
  schema: path.join('prisma'),
} satisfies PrismaConfig;
