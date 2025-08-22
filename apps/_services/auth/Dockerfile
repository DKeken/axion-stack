# Multi-stage Dockerfile for NestJS API

# Base stage with Bun
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/_services/auth/package.json ./apps/_services/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/common/package.json ./packages/common/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/_configs/eslint-config/package.json ./packages/_configs/eslint-config/

# Install dependencies
RUN bun install

# Development stage
FROM base AS development
COPY . .
WORKDIR /app/apps/_services/auth
EXPOSE 3002
CMD ["bun", "run", "start:dev"]

# Build stage
FROM base AS build
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN bun run db:generate

# Build the application
WORKDIR /app/apps/_services/auth
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/apps/_services/auth/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/_services/auth/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["bun", "run", "start:prod"]