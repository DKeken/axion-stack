# Multi-stage Dockerfile for NestJS API

# Base stage with Bun
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN bun install --frozen-lockfile

# Development stage
FROM base AS development
COPY . .
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "run", "start:dev"]

# Build stage
FROM base AS build
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN bun run db:generate

# Build the application
WORKDIR /app/apps/api
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start:prod"]