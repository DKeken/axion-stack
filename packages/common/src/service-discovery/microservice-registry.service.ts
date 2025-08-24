import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getServiceCapabilities } from '@repo/contracts';

import { ContractDiscoveryService } from './contract-discovery.service';
import { ServiceRegistryService } from './service-registry.service';

import type { ServiceRegistration } from './types';

/**
 * Auto-register microservice in service registry
 */
@Injectable()
export class MicroserviceRegistryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MicroserviceRegistryService.name);

  constructor(
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly configService: ConfigService,
    private readonly contractDiscovery: ContractDiscoveryService
  ) {}

  async onModuleInit(): Promise<void> {
    // Auto-register this microservice
    const serviceName = this.getServiceName();
    const serviceVersion = this.getServiceVersion();
    const queueName = this.getQueueName(serviceName);
    const capabilities = this.getServiceCapabilities();

    this.logger.log(`🚀 [INIT] Initializing microservice ${serviceName}`);

    const registration: Omit<ServiceRegistration, 'instanceId' | 'registeredAt' | 'lastHeartbeat'> =
      {
        name: serviceName,
        version: serviceVersion,
        queueName,
        status: 'starting',
        capabilities,
        metadata: {
          port: this.configService.get('PORT'),
          nodeEnv: this.configService.get('NODE_ENV'),
          pid: process.pid,
        },
        host: 'localhost', // или получить из конфига
        port: this.configService.get('PORT'),
      };

    try {
      this.logger.log(
        `🔧 [INIT] Registering service: ${serviceName}@${serviceVersion} (queue: ${queueName})`
      );
      await this.serviceRegistry.register(registration);

      // Update status to healthy after successful registration
      await this.serviceRegistry.updateStatus('healthy');

      this.logger.log(`✅ [INIT] Microservice ${serviceName} registered with service discovery`);
    } catch (error) {
      this.logger.error('❌ [INIT] Failed to register microservice:', error);
      // Don't throw to avoid breaking app startup
    }
  }

  async onModuleDestroy(): Promise<void> {
    // ServiceRegistryService handles deregistration automatically
    this.logger.log('🔴 Microservice shutting down, deregistering...');
  }

  private getServiceName(): string {
    // Try to detect service name from environment or default
    const envServiceName = this.configService.get('SERVICE_NAME');
    if (envServiceName) {
      return envServiceName;
    }

    // Fallback: detect from port or package
    const port = this.configService.get('PORT');
    switch (port) {
      case '3002':
      case 3002:
        return 'auth';
      case '3003':
      case 3003:
        return 'users';
      default:
        return 'unknown-service';
    }
  }

  private getServiceVersion(): string {
    return this.configService.get('SERVICE_VERSION') || '1.0.0';
  }

  private getQueueName(serviceName: string): string {
    // Generate queue name based on service name
    const prefix = this.configService.get('RABBITMQ_QUEUE_PREFIX') || 'axion';
    return `${prefix}.${serviceName}.service`;
  }

  private getServiceCapabilities(): string[] {
    const serviceName = this.getServiceName();

    // Получаем capabilities из ts-rest контрактов (Single Source of Truth)
    const contractCapabilities = getServiceCapabilities(serviceName);

    // Получаем реально обнаруженные MessagePattern через Discovery Service
    const discoveredCapabilities = this.contractDiscovery.getDiscoveredCapabilities();

    // Объединяем контрактные capabilities с обнаруженными (включая health.check)
    const allCapabilities = [
      ...contractCapabilities,
      ...discoveredCapabilities.filter((cap) => cap.includes('health.')), // Добавляем health endpoints
    ];

    // Убираем дубликаты и возвращаем уникальный список
    const uniqueCapabilities = [...new Set(allCapabilities)];

    this.logger.debug(
      `📋 Service capabilities for '${serviceName}': [${uniqueCapabilities.join(', ')}]`
    );

    return uniqueCapabilities;
  }
}
