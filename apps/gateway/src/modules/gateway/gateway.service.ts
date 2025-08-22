import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AuthResponseUtils, JwtValidationService } from '@repo/common';
import { firstValueFrom, timeout } from 'rxjs';

import type { AppConfig } from '@/config/configuration';
import type { MicroserviceRequest, MicroserviceResponse } from '@repo/common/types';
import type { Request, Response } from 'express';

@Injectable()
export class GatewayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GatewayService.name);
  private authClient!: ClientProxy;
  private userClient!: ClientProxy;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly jwtValidationService: JwtValidationService
  ) {}

  async onModuleInit(): Promise<void> {
    // Create microservice clients
    this.authClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
        queue: 'auth_service_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.userClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
        queue: 'user_service_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    // Connect to microservices
    await Promise.all([this.authClient.connect(), this.userClient.connect()]);

    this.logger.log('Gateway service connected to microservices');
  }

  async proxyToService(serviceName: string, req: Request, res: Response): Promise<void> {
    try {
      // Remove the API prefix and service name from the path
      const servicePath = req.path.replace(`/api/v1/${serviceName}`, '') || '/';

      // Prepare headers (exclude sensitive/internal headers)
      const headers: Record<string, string> = {};
      Object.entries(req.headers).forEach(([key, value]) => {
        if (
          key !== 'host' &&
          key !== 'content-length' &&
          key !== 'connection' &&
          key !== 'content-encoding' &&
          typeof value === 'string'
        ) {
          headers[key] = value;
        }
      });

      // Extract user context from tokens for microservice requests
      const user = await this.jwtValidationService.extractUserFromRequest(req).catch(() => null);

      // Create microservice request
      const microserviceRequest: MicroserviceRequest = {
        method: req.method,
        path: servicePath,
        query: req.query as Record<string, unknown>,
        headers,
        body: req.body,
        user: user ?? undefined,
      };

      this.logger.debug(
        `Gateway request: ${req.method} ${req.path} -> ${serviceName}${servicePath}`
      );

      const client = this.getClientForService(serviceName);

      if (!client) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      // Route to appropriate message pattern based on path and method
      const messagePattern = this.getMessagePattern(serviceName, servicePath, req.method);

      if (!messagePattern) {
        res.status(404).json({ error: 'Endpoint not found' });
        return;
      }

      // Send message to microservice with timeout
      const response: MicroserviceResponse = await firstValueFrom(
        client.send<MicroserviceResponse>(messagePattern, microserviceRequest).pipe(
          timeout(30000) // 30 seconds timeout
        )
      );

      // Handle microservice response
      if (response.error) {
        // Clear auth cookies on auth failures
        AuthResponseUtils.handleErrorCookies(
          serviceName,
          servicePath,
          req.method,
          response.status,
          res
        );
        res.status(response.status || 500).json({ error: response.error });
      } else {
        // Handle authentication cookies for auth endpoints
        if (serviceName === 'auth') {
          if (
            AuthResponseUtils.shouldSetAuthCookies(servicePath, req.method, response.status) &&
            response.data
          ) {
            AuthResponseUtils.handleAuthCookies(response.data, res);
          }
          AuthResponseUtils.handleLogoutCookies(servicePath, req.method, response.status, res);
        }

        res.status(response.status || 200).json(response.data || response);
      }
    } catch (error) {
      this.logger.error(`Error in gateway for service ${serviceName}:`, error);

      if (!res.headersSent) {
        if (error instanceof Error && error.message.includes('Timeout')) {
          res.status(504).json({
            error: 'Gateway Timeout',
            message: `Request to ${serviceName} service timed out`,
          });
        } else {
          res.status(502).json({
            error: 'Bad Gateway',
            message: `Failed to process request to ${serviceName} service`,
          });
        }
      }
    }
  }

  private getClientForService(serviceName: string): ClientProxy | null {
    switch (serviceName) {
      case 'auth':
        return this.authClient;
      case 'users':
        return this.userClient;
      default:
        return null;
    }
  }

  private getMessagePattern(serviceName: string, path: string, method: string): string | null {
    // Auth service patterns based on ts-rest contract
    if (serviceName === 'auth') {
      if (path === '/register' && method === 'POST') return 'auth.register';
      if (path === '/login' && method === 'POST') return 'auth.login';
      if (path === '/refresh' && method === 'POST') return 'auth.refresh';
      if (path === '/logout' && method === 'POST') return 'auth.logout';
      if (path === '/profile' && method === 'GET') return 'auth.profile';
    }

    // Users service patterns based on ts-rest contract
    if (serviceName === 'users') {
      if (path === '/' && method === 'GET') return 'users.list';
      if (path === '/' && method === 'POST') return 'users.create';
      if (path.match(/^\/\d+$/) && method === 'GET') return 'users.get';
      if (path.match(/^\/\d+$/) && method === 'PUT') return 'users.update';
      if (path.match(/^\/\d+$/) && method === 'DELETE') return 'users.delete';
    }

    return null;
  }

  async onModuleDestroy(): Promise<void> {
    // Clean up connections
    await Promise.all([this.authClient?.close(), this.userClient?.close()]);
  }
}
