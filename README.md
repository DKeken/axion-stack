<img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/0863470a-f709-4863-ad82-7e977f8ebd23" />
<img width="256" height="256" alt="Снимок экрана 2025-08-22 в 09 06 46" src="https://github.com/user-attachments/assets/bc3995c1-6321-45a4-8d09-0f451ac13421" />

> **Enterprise-grade monorepo platform with end-to-end type safety**

[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Powered by Bun](https://img.shields.io/badge/Powered%20by-Bun-f472b6.svg)](https://bun.sh/)
[![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-ef4444.svg)](https://turbo.build/)
[![GitHub stars](https://img.shields.io/github/stars/DKeken/axion-stack?style=social)](https://github.com/DKeken/axion-stack/stargazers)
[![GitHub downloads](https://img.shields.io/github/downloads/DKeken/axion-stack/total?color=brightgreen)](https://github.com/DKeken/axion-stack/releases)

## 🚀 Quick Start

Get up and running in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/DKeken/axion-stack.git
cd axion-stack

# Install dependencies
bun install

# Start development environment
bun run docker:up    # Start PostgreSQL, Redis, RabbitMQ
bun run db:setup     # Initialize database schema
bun run dev          # Start all services
```

**🎯 Access Points:**

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Auth Service**: http://localhost:3002
- **User Service**: http://localhost:3003
- **Database UI**: http://localhost:8081 (Redis Commander)
- **Message Broker**: http://localhost:15672 (RabbitMQ Management)
- **Monitoring**: http://localhost:9090 (Prometheus), http://localhost:3100
  (Grafana)

## 🏗️ Architecture

**Production-ready microservices architecture** with complete type safety from
database to client. Features intelligent service orchestration, automatic code
generation, and enterprise-grade security patterns.

### Core Services

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Web App   │────│   Gateway   │────│   Auth      │
│  TanStack   │    │   NestJS    │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                   ┌─────────────┐    
                   │   User      │
                   │  Service    │
                   └─────────────┘    

       ┌─────────────┐        ┌─────────────┐
       │  RabbitMQ   │        │    Redis    │
       │   Broker    │        │   Cache     │
       └─────────────┘        └─────────────┘
             ▲                        ▲
             │                        │
   ┌─────────┴────────────┐   ┌────────┴─────────┐
   │   All services use   │   │   All services   │
   │   RabbitMQ for comm  │   │  access Redis    │
   └──────────────────────┘   └──────────────────┘
             ▲
             │
       ┌─────────────┐
       │  Database   │
       │ PostgreSQL  │
       └─────────────┘
             ▲
             │
   ┌─────────┴───────────┐
   │   All services can  │
   │   query PostgreSQL  │
   └─────────────────────┘

```

### 🎯 Key Features

- **🛡️ End-to-End Type Safety** — Prisma → TS-REST → React with compile-time
  guarantees
- **⚡ Ultra-High Performance** — Bun runtime with sub-millisecond startup times
- **🔄 Smart Build System** — Turborepo with intelligent dependency caching
- **🎯 Auto Code Generation** — Database schema to TypeScript types pipeline
- **🏗️ Microservices Ready** — Scalable service architecture with message queues
- **🔒 Security First** — JWT authentication, rate limiting, and input
  validation
- **📡 Event-Driven Communication** — RabbitMQ for reliable inter-service
  messaging
- **📊 Built-in Monitoring** — Prometheus metrics with Grafana dashboards
- **🧪 Load Testing Ready** — Artillery + Playwright for performance validation
- **🌐 Internationalization** — Built-in i18n support with Paraglide
- **📱 Modern UI** — React 19 + HeroUI with responsive design

## 🛠️ Tech Stack

### Backend

- **NestJS** — Enterprise Node.js framework
- **Prisma ORM** — Type-safe database access
- **PostgreSQL** — Primary database
- **Redis** — Caching and sessions
- **RabbitMQ** — Message broker
- **TS-REST** — End-to-end type safety
- **JWT** — Authentication & authorization

### Frontend

- **TanStack Start** — Full-stack React framework
- **React 19** — Latest React with concurrent features
- **HeroUI** — Modern component library
- **TailwindCSS** — Utility-first styling
- **Zustand** — State management
- **React Query** — Server state management

### Infrastructure

- **Bun** — JavaScript runtime & package manager
- **Turborepo** — Monorepo build system
- **Docker** — Containerization
- **TypeScript 5.6+** — Type safety
- **ESLint + Prettier** — Code quality

### Monitoring & Testing

- **Prometheus** — Metrics collection and monitoring
- **Grafana** — Metrics visualization and dashboards
- **Playwright** — End-to-end browser testing
- **Artillery** — Load testing and performance benchmarks

## 📁 Project Structure

```
axion-stack/
├── apps/
│   ├── _services/           # Microservices
│   │   ├── auth/           # Authentication service
│   │   ├── user/           # User management service
│   │   └── gateway/        # API Gateway
│   └── web/                # Frontend application
├── packages/
│   ├── common/             # Shared utilities
│   ├── contracts/          # API contracts (TS-REST)
│   ├── database/           # Prisma schema & types
│   └── infrastructure/     # Database & Redis modules
└── docker-compose.yml      # Development environment
```

## 🎯 Development Workflow

### Environment Setup

```bash
# 1. Clone and install
git clone https://github.com/DKeken/axion-stack.git
cd axion-stack
bun install

# 2. Start infrastructure
bun run docker:up

# 3. Setup database
bun run db:setup

# 4. Start development
bun run dev
```

### Available Commands

```bash
# Development
bun run dev              # Start all services in development mode
bun run build            # Build all applications
bun run start            # Start production builds

# Database Operations
bun run db:setup         # Initialize database with schema
bun run db:generate      # Generate Prisma client
bun run db:push          # Push schema changes to database
bun run db:migrate       # Run database migrations
bun run db:studio        # Open Prisma Studio
bun run db:reset         # Reset database (⚠️  destructive)

# Docker Operations
bun run docker:up        # Start PostgreSQL, Redis, RabbitMQ
bun run docker:down      # Stop all containers
bun run docker:logs      # View container logs

# Code Quality
bun run lint             # Run ESLint across all packages
bun run format           # Format code with Prettier
bun run check-types      # TypeScript type checking
```

### Development URLs

| Service          | URL                    | Description                    |
| ---------------- | ---------------------- | ------------------------------ |
| **Web App**      | http://localhost:3000  | React frontend application     |
| **API Gateway**  | http://localhost:3001  | Main API endpoint              |
| **Auth Service** | http://localhost:3002  | Authentication microservice    |
| **User Service** | http://localhost:3003  | User management microservice   |
| **Redis UI**     | http://localhost:8081  | Redis Commander (admin/admin)  |
| **RabbitMQ**     | http://localhost:15672 | Management UI (admin/password) |
| **Prometheus**   | http://localhost:9090  | Metrics collection server      |
| **Grafana**      | http://localhost:3100  | Monitoring dashboards          |

## 🔒 Authentication Flow

The application implements a secure JWT-based authentication system:

1. **User Registration** → Email verification → Account activation
2. **Login** → Access token (15min) + Refresh token (7 days)
3. **Token Refresh** → Automatic token rotation with device fingerprinting
4. **Logout** → Token blacklisting and cleanup

### API Endpoints

```bash
# Authentication
POST /api/v1/auth/register    # Create new user account
POST /api/v1/auth/login       # Login with email/password
POST /api/v1/auth/refresh     # Refresh access token
POST /api/v1/auth/logout      # Logout and revoke tokens
GET  /api/v1/auth/profile     # Get current user info

# User Management
GET    /api/v1/users          # List users (paginated, searchable)
GET    /api/v1/users/:id      # Get user by ID
POST   /api/v1/users          # Create new user (admin)
PATCH  /api/v1/users/:id      # Update user information
DELETE /api/v1/users/:id      # Delete user account
```

## 🏗️ Architecture Patterns

### Type-Safe API Contracts

```typescript
// Shared contract definition
export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: loginSchema,
    responses: { 200: authResponseSchema },
  },
});

// Auto-generated client hooks
const { mutate: login } = authContract.login.useMutation();
```

### Microservices Communication

- **Synchronous**: TS-REST contracts for HTTP APIs
- **Asynchronous**: RabbitMQ message queues for events
- **Caching**: Redis for session storage and API caching
- **Database**: Shared PostgreSQL with service-specific schemas

### Code Generation Pipeline

```bash
Database Schema (Prisma)
    ↓
Generated Types (Zod schemas)
    ↓
API Contracts (TS-REST)
    ↓
Frontend Hooks (React Query)
```

## 📊 Monitoring & Observability

### Metrics Collection

The system includes comprehensive monitoring with **Prometheus** and
**Grafana**:

```bash
# Start monitoring stack
bun run docker:up          # Includes Prometheus & Grafana

# Access monitoring
open http://localhost:9090  # Prometheus metrics
open http://localhost:3100  # Grafana dashboards
```

### Available Dashboards

- **System Overview**: Service health, response times, error rates
- **Infrastructure Monitoring**: CPU, memory, disk usage
- **Microservices Detailed**: Per-service metrics and traces
- **Load Test Results**: Performance testing metrics from Artillery

### Key Metrics

```bash
# Response Time & Throughput
axion_http_request_duration_seconds
axion_http_requests_total

# Load Testing Metrics
axion_smoke_page_load_time
axion_auth_login_time
axion_stress_response_time
axion_perf_first_contentful_paint

# System Health
axion_service_up
axion_database_connections
axion_cache_hit_ratio
```

## ⚙️ Requirements

- **Bun** ≥ 1.2.18
- **Docker & Docker Compose**
- **Node.js** ≥ 20.0.0 _(fallback)_

## 🧪 Testing & Quality

```bash
# Unit & Integration Tests
bun run test              # Unit tests
bun run test:e2e          # End-to-end tests with Playwright
bun run test:cov          # Coverage report

# Load Testing (Artillery + Playwright)
bun run load:smoke        # Quick smoke test (30s)
bun run load:auth         # Authentication load test (4 min)
bun run load:stress       # Stress testing (9 min)
bun run load:combined     # Combined scenarios (7 min)
bun run load:report       # Generate test report

# Code quality
bun run lint              # ESLint validation
bun run format            # Prettier formatting
bun run check-types       # TypeScript validation
```

### 📊 Load Testing Features

- **Smoke Tests**: Quick validation of core functionality
- **Authentication Tests**: Load testing of auth flows and JWT handling
- **Stress Tests**: High-load scenarios to identify bottlenecks
- **Combined Tests**: Full user journey simulation
- **Metrics Integration**: Automatic reporting to Prometheus
- **Browser Automation**: Real user interaction simulation with Playwright

## 🚢 Production Deployment

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD="your-redis-password"

# RabbitMQ
RABBITMQ_URL="amqp://user:pass@host:5672/"

# JWT Secrets (use strong random strings)
JWT_ACCESS_SECRET="your-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# Application
CORS_ORIGIN="https://yourdomain.com"
NODE_ENV="production"
```

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Deploy with orchestration
docker compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Use **conventional commits** for clear history (see
  [CONTRIBUTING.md](.github/CONTRIBUTING.md))
- Ensure **100% type safety** - no `any` types
- Write **tests** for new features
- Update **documentation** for API changes
- Follow **ESLint** and **Prettier** rules

### Release Process

This project uses automated releases with
[semantic-release](https://semantic-release.gitbook.io/):

- **Commits** → Automatic version bumping
- **Changelog** → Generated from conventional commits
- **GitHub Releases** → Created automatically
- **Version** → Updated in package.json

```bash
# Test what release would be generated
bun run release:dry

# Manual release (normally automated via GitHub Actions)
bun run release
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE)
file for details.

## 💬 Support & Community

- **Issues**: [GitHub Issues](https://github.com/DKeken/axion-stack/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/DKeken/axion-stack/discussions)
- **Email**: your-email@domain.com

---

<div align="center">

**Built with ❤️ using modern web technologies**

[⭐ Star this repo](https://github.com/DKeken/axion-stack) •
[🐛 Report Bug](https://github.com/DKeken/axion-stack/issues) •
[💡 Request Feature](https://github.com/DKeken/axion-stack/issues)

</div>
