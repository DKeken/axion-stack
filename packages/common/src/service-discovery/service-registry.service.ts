import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import type { ServiceRegistration, ServiceDiscoveryConfig } from './types';
import type { DirectRedisService } from '@repo/infrastructure';

@Injectable()
export class ServiceRegistryService implements OnModuleDestroy {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private heartbeatTimer?: NodeJS.Timeout;
  private currentRegistration?: ServiceRegistration;

  constructor(
    @Inject('SERVICE_DISCOVERY_CONFIG') private readonly config: ServiceDiscoveryConfig,
    @Inject('DIRECT_REDIS_SERVICE') private readonly redisService: DirectRedisService
  ) {}

  /**
   * Register service in the registry
   */
  async register(
    registration: Omit<ServiceRegistration, 'instanceId' | 'registeredAt' | 'lastHeartbeat'>
  ): Promise<string> {
    const instanceId = uuidv4();
    const now = new Date().toISOString();

    const fullRegistration: ServiceRegistration = {
      ...registration,
      instanceId,
      registeredAt: now,
      lastHeartbeat: now,
    };

    this.currentRegistration = fullRegistration;

    const registryKey = this.buildRegistryKey(registration.name, instanceId);

    try {
      // Store service registration in Redis
      await this.redisService.set(
        registryKey,
        JSON.stringify(fullRegistration),
        this.config.serviceTtl
      );

      this.logger.log(
        `✅ [REGISTER] Service registered: ${registration.name}@${registration.version} (${instanceId}) queue: ${registration.queueName}`
      );

      // Notify Gateway about service registration
      await this.notifyServiceRegistration(registration.name);

      // Start heartbeat
      this.startHeartbeat();

      return instanceId;
    } catch (error) {
      this.logger.error('❌ [REGISTER] Failed to register service:', error);
      throw error;
    }
  }

  /**
   * Update service status
   */
  async updateStatus(status: ServiceRegistration['status']): Promise<void> {
    if (!this.currentRegistration) {
      this.logger.warn('Cannot update status: service not registered');
      return;
    }

    this.currentRegistration.status = status;
    await this.sendHeartbeat();
  }

  /**
   * Discover services by name
   */
  async discover(serviceName?: string): Promise<ServiceRegistration[]> {
    try {
      const pattern = serviceName
        ? `${this.config.registryPrefix}:${serviceName}:*`
        : `${this.config.registryPrefix}:*`;

      const keys = await this.redisService.keys(pattern);

      if (keys.length === 0) {
        return [];
      }

      const services: ServiceRegistration[] = [];

      for (const key of keys) {
        try {
          const data = await this.redisService.get(key);
          if (data) {
            const service = JSON.parse(data) as ServiceRegistration;
            services.push(service);
          }
        } catch (error) {
          this.logger.warn(`❌ [DISCOVER] Failed to parse service data for key ${key}:`, error);
        }
      }

      return services;
    } catch (error) {
      this.logger.error('❌ [DISCOVER] Failed to discover services:', error);
      return [];
    }
  }

  /**
   * Get healthy services by name
   */
  async getHealthyServices(serviceName?: string): Promise<ServiceRegistration[]> {
    const allServices = await this.discover(serviceName);

    // Filter only healthy services and check TTL
    const healthyServices: ServiceRegistration[] = [];
    const staleServices: ServiceRegistration[] = [];

    for (const service of allServices) {
      const isHealthy = service.status === 'healthy';
      const timeSinceLastHeartbeat = Date.now() - new Date(service.lastHeartbeat).getTime();
      const isRecentHeartbeat = timeSinceLastHeartbeat < this.config.serviceTtl * 1000;

      if (isHealthy && isRecentHeartbeat) {
        healthyServices.push(service);
      } else if (!isRecentHeartbeat) {
        staleServices.push(service);
      }
    }

    // Cleanup stale services if enabled
    if (this.config.enableCleanup && staleServices.length > 0) {
      await this.cleanupStaleServices(staleServices);
    }

    return healthyServices;
  }

  /**
   * Clean up stale services from Redis
   */
  private async cleanupStaleServices(staleServices: ServiceRegistration[]): Promise<void> {
    if (staleServices.length === 0) return;

    this.logger.debug(`🧹 [CLEANUP] Cleaning up ${staleServices.length} stale service instances`);

    const cleanupPromises = staleServices.map(async (service) => {
      const registryKey = this.buildRegistryKey(service.name, service.instanceId);
      try {
        await this.redisService.del(registryKey);
        this.logger.debug(
          `🗑️ [CLEANUP] Removed stale service: ${service.name}@${service.instanceId}`
        );
      } catch (error) {
        this.logger.warn(
          `Failed to remove stale service ${service.name}@${service.instanceId}:`,
          error
        );
      }
    });

    await Promise.all(cleanupPromises);
    this.logger.debug(`✅ [CLEANUP] Completed`);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat().catch((error) => {
        this.logger.error('Heartbeat failed:', error);
      });
    }, this.config.heartbeatInterval);
  }

  /**
   * Send heartbeat to registry
   */
  private async sendHeartbeat(): Promise<void> {
    if (!this.currentRegistration) {
      return;
    }

    const registryKey = this.buildRegistryKey(
      this.currentRegistration.name,
      this.currentRegistration.instanceId
    );

    try {
      const now = new Date().toISOString();
      this.currentRegistration.lastHeartbeat = now;

      await this.redisService.set(
        registryKey,
        JSON.stringify(this.currentRegistration),
        this.config.serviceTtl
      );
    } catch (error) {
      this.logger.error('Failed to send heartbeat:', error);
    }
  }

  /**
   * Notify Gateway about service registration via Redis pub/sub
   */
  private async notifyServiceRegistration(serviceName: string): Promise<void> {
    try {
      const channel = 'axion:services:events';
      const message = JSON.stringify({
        type: 'SERVICE_REGISTERED',
        serviceName,
        timestamp: Date.now(),
        pid: process.pid,
      });

      await this.redisService.publish(channel, message);
    } catch (error) {
      this.logger.warn(
        `⚠️ [NOTIFY] Failed to publish service registration for '${serviceName}':`,
        error
      );
    }
  }

  /**
   * Build registry key for Redis
   */
  private buildRegistryKey(serviceName: string, instanceId: string): string {
    return `${this.config.registryPrefix}:${serviceName}:${instanceId}`;
  }

  /**
   * Deregister service
   */
  async deregister(): Promise<void> {
    if (!this.currentRegistration) {
      this.logger.log('🟡 [DEREGISTER] No current registration to deregister');
      return;
    }

    this.logger.log(
      `🔴 [DEREGISTER] Starting deregistration for service: ${this.currentRegistration.name} (${this.currentRegistration.instanceId})`
    );

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
      this.logger.log('💓 [DEREGISTER] Stopped heartbeat timer');
    }

    const registryKey = this.buildRegistryKey(
      this.currentRegistration.name,
      this.currentRegistration.instanceId
    );

    try {
      await this.redisService.del(registryKey);
      this.logger.log(
        `✅ [DEREGISTER] Service deregistered: ${this.currentRegistration.name} (${this.currentRegistration.instanceId})`
      );
    } catch (error) {
      this.logger.error('❌ [DEREGISTER] Failed to deregister service:', error);
    }

    this.currentRegistration = undefined;
  }

  async onModuleDestroy(): Promise<void> {
    await this.deregister();
  }
}
