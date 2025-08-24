import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ServiceRegistryService, DynamicRouteMapperService } from '@repo/common';
import { getServiceRoutesFromContracts } from '@repo/contracts';
import { RedisService, DirectRedisService } from '@repo/infrastructure';

import type { ServiceRegistration } from '@repo/common';

interface MicroserviceClient {
  serviceName: string;
  client: ClientProxy;
  registration: ServiceRegistration;
}

@Injectable()
export class ServiceDiscoveryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServiceDiscoveryService.name);
  private clients = new Map<string, MicroserviceClient>();
  private discoveryTimer?: NodeJS.Timeout;
  private debounceTimer?: NodeJS.Timeout;
  private isSubscribed = false;
  private readonly DEBOUNCE_MS = 1000; // 1 секунда debounce для группировки событий

  constructor(
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly routeMapper: DynamicRouteMapperService,
    private readonly redisService: RedisService,
    private readonly directRedisService: DirectRedisService
  ) {}

  async onModuleInit(): Promise<void> {
    // 🎯 Register route configurations from ts-rest contracts (Single Source of Truth)
    this.logger.log('📋 Loading routes from ts-rest contracts...');
    const contractRoutes = getServiceRoutesFromContracts();

    // Менее verbose логи для production
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `🔄 Found ${contractRoutes.length} services in contracts: [${contractRoutes.map((s) => s.serviceName).join(', ')}]`
      );
    }

    for (const routeConfig of contractRoutes) {
      this.routeMapper.registerServiceRoutes(routeConfig);
      // Убираем debug логи для каждого сервиса чтобы уменьшить spam
    }

    // Initial discovery
    await this.discoverServices();

    // Start periodic discovery
    this.startPeriodicDiscovery();

    // Subscribe to real-time service registration events
    await this.subscribeToServiceEvents();
  }

  /**
   * Get client for service by name
   */
  getClient(serviceName: string): ClientProxy | null {
    const client = this.clients.get(serviceName);
    return client?.client || null;
  }

  /**
   * Get all available services
   */
  getAvailableServices(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Force immediate service discovery (useful for startup)
   */
  async forceDiscovery(): Promise<string[]> {
    await this.discoverServices();
    return this.getAvailableServices();
  }

  /**
   * Get service registration info
   */
  getServiceInfo(serviceName: string): ServiceRegistration | null {
    const client = this.clients.get(serviceName);
    return client?.registration || null;
  }

  /**
   * Find route for HTTP request
   */
  findRoute(serviceName: string, path: string, method: string) {
    return this.routeMapper.findRoute(serviceName, path, method);
  }

  /**
   * Discover services and create clients
   */
  async discoverServices(): Promise<void> {
    // Убираем debug лог для уменьшения spam'а

    try {
      const services = await this.serviceRegistry.getHealthyServices();

      // Group services by name (multiple instances of same service)
      const serviceGroups = new Map<string, ServiceRegistration[]>();

      for (const service of services) {
        if (!serviceGroups.has(service.name)) {
          serviceGroups.set(service.name, []);
        }
        const serviceGroup = serviceGroups.get(service.name);
        if (serviceGroup) {
          serviceGroup.push(service);
        }
      }

      // Create or update clients for each service
      for (const [serviceName, instances] of serviceGroups) {
        // Use first healthy instance for now (could implement load balancing later)
        const selectedInstance = instances[0];

        const existingClient = this.clients.get(serviceName);

        // Check if we need to create/update the client
        if (
          !existingClient ||
          existingClient.registration.queueName !== selectedInstance.queueName
        ) {
          // Close existing client if it exists
          if (existingClient) {
            await this.closeClient(existingClient);
          }

          // Create new client
          await this.createClient(selectedInstance);
        } else {
          // Update registration info
          existingClient.registration = selectedInstance;
        }

        // Update route mapper with service capabilities
        this.routeMapper.updateServiceCapabilities(serviceName, selectedInstance.capabilities);
      }

      // Remove clients for services that are no longer available
      for (const [serviceName, client] of this.clients) {
        if (!serviceGroups.has(serviceName)) {
          this.logger.log(`🔴 Service ${serviceName} no longer available, removing client`);
          await this.closeClient(client);
          this.clients.delete(serviceName);
          this.routeMapper.removeService(serviceName);
        }
      }

      // Логируем только важные изменения, а не каждый discovery
      const availableServices = this.getAvailableServices();
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
        // Показываем только ~10% логов для уменьшения spam'а
        this.logger.debug(
          `🎯 Service discovery completed. Available services: [${availableServices.join(', ')}]`
        );
      }
    } catch (error) {
      this.logger.error('Failed to discover services:', error);
    }
  }

  /**
   * Create client for service
   */
  private async createClient(registration: ServiceRegistration): Promise<void> {
    try {
      const client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: registration.queueName,
          queueOptions: {
            durable: true,
          },
        },
      });

      // Connect to the service
      await client.connect();

      const microserviceClient: MicroserviceClient = {
        serviceName: registration.name,
        client,
        registration,
      };

      this.clients.set(registration.name, microserviceClient);

      this.logger.log(
        `✅ Connected to ${registration.name} service (queue: ${registration.queueName})`
      );
    } catch (error) {
      this.logger.error(`Failed to create client for ${registration.name}:`, error);
    }
  }

  /**
   * Close client connection
   */
  private async closeClient(microserviceClient: MicroserviceClient): Promise<void> {
    try {
      await microserviceClient.client.close();
      this.logger.debug(`🔌 Closed connection to ${microserviceClient.serviceName} service`);
    } catch (error) {
      this.logger.warn(`Error closing client for ${microserviceClient.serviceName}:`, error);
    }
  }

  /**
   * Start periodic service discovery
   */
  private startPeriodicDiscovery(): void {
    // Clear any existing timer to prevent multiple timers during HMR
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
      this.logger.debug('🧹 Cleared existing discovery timer');
    }

    // With pub/sub real-time discovery, periodic discovery is now just a backup safety net
    const interval = process.env.NODE_ENV === 'development' ? 30000 : 60000;

    this.discoveryTimer = setInterval(() => {
      this.discoverServices().catch((error) => {
        this.logger.error('Periodic service discovery failed:', error);
      });
    }, interval);

    this.logger.log(
      `📡 Started periodic service discovery (${interval / 1000}s interval) - pub/sub handles real-time discovery`
    );
  }

  /**
   * Subscribe to real-time service registration events via Redis pub/sub
   */
  private async subscribeToServiceEvents(): Promise<void> {
    try {
      // Подписываемся на канал событий сервисов
      const channel = 'axion:services:events';

      // Создаем отдельный Redis client для подписки
      await this.setupServiceEventSubscription(channel);

      this.logger.log(`📡 [REAL-TIME] Subscribed to service events on channel: ${channel}`);
    } catch (error) {
      this.logger.warn('⚠️ Failed to subscribe to service events:', error);
      this.logger.debug('📡 Falling back to periodic discovery only');
    }
  }

  /**
   * Setup Redis pub/sub subscription for service events
   */
  private async setupServiceEventSubscription(channel: string): Promise<void> {
    try {
      // Настраиваем обработчики событий
      const messageHandler = (receivedChannel: string, message: string) => {
        if (receivedChannel === channel) {
          this.handleServiceRegistrationEvent(message).catch((error) => {
            this.logger.warn('⚠️ [PUB/SUB] Error handling service event:', error);
          });
        }
      };

      const errorHandler = (error: Error) => {
        this.logger.error('❌ [PUB/SUB] Redis subscriber error:', error);
        this.isSubscribed = false;
      };

      // Подписываемся на канал через DirectRedisService
      await this.directRedisService.subscribe(channel, messageHandler, errorHandler);
      this.isSubscribed = true;

      this.logger.log(`✅ [PUB/SUB] Successfully subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error('❌ Failed to setup service event subscription:', error);
      // Не бросаем error, чтобы приложение продолжило работать с periodic discovery
      this.logger.warn('🔄 Falling back to periodic discovery only');
    }
  }

  /**
   * Handle incoming service registration event with debouncing
   */
  private async handleServiceRegistrationEvent(message: string): Promise<void> {
    try {
      const event = JSON.parse(message);

      if (event.type === 'SERVICE_REGISTERED') {
        this.logger.log(
          `⚡ [REAL-TIME] Service '${event.serviceName}' registered (PID: ${event.pid})`
        );

        // Используем debouncing для группировки множественных событий
        this.debouncedDiscovery();
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to handle service registration event:', error);
    }
  }

  /**
   * Debounced discovery to prevent spam from multiple registration events
   */
  private debouncedDiscovery(): void {
    // Отменяем предыдущий таймер, если он есть
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Устанавливаем новый таймер
    this.debounceTimer = setTimeout(() => {
      this.discoverServices()
        .then(() => {
          this.logger.debug('🔄 [REAL-TIME] Debounced service discovery completed');
        })
        .catch((error) => {
          this.logger.error('❌ [REAL-TIME] Debounced service discovery failed:', error);
        });
    }, this.DEBOUNCE_MS);
  }

  /**
   * Stop periodic discovery and close all clients
   */
  async onModuleDestroy(): Promise<void> {
    // Stop periodic discovery
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
    }

    // Stop debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    // Close Redis pub/sub subscription
    if (this.isSubscribed) {
      try {
        await this.directRedisService.unsubscribeAll();
        this.isSubscribed = false;
        this.logger.debug('🔌 [PUB/SUB] Redis subscriber disconnected');
      } catch (error) {
        this.logger.warn('⚠️ [PUB/SUB] Error disconnecting Redis subscriber:', error);
      }
    }

    // Close all microservice clients
    const closePromises = Array.from(this.clients.values()).map((client) =>
      this.closeClient(client)
    );

    await Promise.all(closePromises);
    this.clients.clear();

    this.logger.log('🔴 Service discovery service shut down');
  }
}
