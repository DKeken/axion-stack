import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import type { ServiceRegistration, ServiceDiscoveryConfig } from './types';
import type { DirectRedisService } from '@repo/infrastructure';

@Injectable()
export class ServiceRegistryService implements OnModuleDestroy {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private heartbeatTimer?: NodeJS.Timeout;
  private currentRegistration?: ServiceRegistration;
  private static registrationLocks = new Map<string, Promise<void>>();
  private lastReregistrationTime = 0;
  private reregistrationBackoff = 5000; // 5 секунд минимум между перерегистрациями

  constructor(
    @Inject('SERVICE_DISCOVERY_CONFIG') private readonly config: ServiceDiscoveryConfig,
    @Inject('DIRECT_REDIS_SERVICE') private readonly redisService: DirectRedisService
  ) {}

  /**
   * Clean up old instances of a service before registering a new one
   */
  private async cleanupOldInstances(serviceName: string): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';

    try {
      // В development режиме делаем принудительную очистку только если есть дубликаты
      if (isDevelopment) {
        const pattern = `${this.config.registryPrefix}:${serviceName}:*`;
        const existingKeys = await this.redisService.keys(pattern);
        // Делаем cleanup только если есть больше 1 экземпляра
        if (existingKeys.length > 1) {
          await this.forceDuplicateCleanup(serviceName);
        } else if (existingKeys.length === 1) {
          this.logger.log(
            `🔍 [TIMESTAMP-CLEANUP] Single instance found for '${serviceName}' - no cleanup needed`
          );
        }
      }

      const pattern = `${this.config.registryPrefix}:${serviceName}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 0) {
        this.logger.log(
          `🧹 [HMR-CLEANUP] Found ${keys.length} old instances of service '${serviceName}' - cleaning up...`
        );

        // В development режиме показываем подробную информацию
        if (isDevelopment) {
          for (const key of keys) {
            try {
              const data = await this.redisService.get(key);
              if (data) {
                const service = JSON.parse(data);
                const timeSinceHeartbeat = Date.now() - new Date(service.lastHeartbeat).getTime();
                this.logger.log(
                  `🗑️ [HMR-CLEANUP] Removing: ${key} (heartbeat: ${Math.floor(timeSinceHeartbeat / 1000)}s ago, status: ${service.status})`
                );
              } else {
                this.logger.log(`🗑️ [HMR-CLEANUP] Removing empty key: ${key}`);
              }
            } catch (_parseError) {
              this.logger.log(`🗑️ [HMR-CLEANUP] Removing corrupted key: ${key}`);
            }
          }
        } else {
          // В production просто показываем что удаляем
          for (const key of keys) {
            this.logger.log(`🗑️ [HMR-CLEANUP] Removing old instance: ${key}`);
          }
        }

        // Сначала помечаем все ключи как deprecated, чтобы старые процессы не восстанавливали их
        const currentTime = Date.now();
        const deprecationPromises = keys.map(async (key) => {
          try {
            const data = await this.redisService.get(key);
            if (data) {
              const service = JSON.parse(data);
              service.deprecated = true;
              service.deprecatedAt = new Date(currentTime).toISOString();
              service.deprecatedBy = process.pid;
              await this.redisService.set(key, JSON.stringify(service), 10); // TTL 10 секунд для deprecated
            }
          } catch (_error) {
            // Если не удается пометить - просто удалим
            await this.redisService.del(key);
          }
        });
        await Promise.all(deprecationPromises);

        this.logger.log(`🏷️ [HMR-CLEANUP] Marked ${keys.length} instances as deprecated`);

        // Ждем немного, чтобы старые процессы увидели deprecation
        if (isDevelopment) {
          this.logger.log(`⏳ [HMR-CLEANUP] Waiting 1s for old processes to see deprecation...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Теперь удаляем deprecated ключи
        await Promise.all(keys.map((key) => this.redisService.del(key)));

        this.logger.log(
          `✅ [HMR-CLEANUP] Cleaned up ${keys.length} old instances of service '${serviceName}'`
        );
      } else {
        this.logger.log(
          `🔍 [HMR-CLEANUP] No old instances found for service '${serviceName}' - clean start`
        );
      }
    } catch (error) {
      this.logger.warn(
        `❌ [HMR-CLEANUP] Failed to cleanup old instances of service '${serviceName}':`,
        error
      );
      // Не прерываем регистрацию, если очистка не удалась
    }
  }

  /**
   * Force cleanup of duplicate services based on timestamp
   * Keeps only the freshest instance and removes all older ones
   */
  private async forceDuplicateCleanup(serviceName: string): Promise<void> {
    try {
      const pattern = `${this.config.registryPrefix}:${serviceName}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 1) {
        this.logger.log(
          `🔍 [TIMESTAMP-CLEANUP] Found ${keys.length} instances of '${serviceName}' - keeping only the freshest`
        );

        const serviceInstances = [];

        // Парсим все экземпляры с их timestamp
        for (const key of keys) {
          try {
            // Извлекаем timestamp из ключа: axion:services:serviceName:timestamp:instanceId
            const keyParts = key.split(':');
            const timestamp = parseInt(keyParts[3], 10);

            const data = await this.redisService.get(key);
            if (data && !isNaN(timestamp)) {
              const service = JSON.parse(data);
              serviceInstances.push({
                key,
                timestamp,
                instanceId: keyParts[4],
                service,
                age: Date.now() - timestamp,
              });
            } else {
              // Невалидный ключ или данные - пометим для удаления
              serviceInstances.push({
                key,
                timestamp: 0,
                instanceId: 'invalid',
                service: null,
                age: Infinity,
              });
            }
          } catch (_parseError) {
            // Ошибка парсинга - пометим для удаления
            serviceInstances.push({
              key,
              timestamp: 0,
              instanceId: 'invalid',
              service: null,
              age: Infinity,
            });
          }
        }

        // Исключаем текущий экземпляр из cleanup (если он уже зарегистрирован)
        const currentInstanceId = this.currentRegistration?.instanceId;
        let filteredInstances = serviceInstances;

        if (currentInstanceId) {
          // Фильтруем, исключая текущий экземпляр
          filteredInstances = serviceInstances.filter(
            (instance) => instance.instanceId !== currentInstanceId
          );

          // Если остался только текущий экземпляр - cleanup не нужен
          if (filteredInstances.length === 0) {
            this.logger.log(
              `🔍 [TIMESTAMP-CLEANUP] Only current instance exists for '${serviceName}' - no cleanup needed`
            );
            return;
          }

          // Скипаем debug log для уменьшения spam'а
        }

        // Определяем что удалять
        let instancesToDelete: {
          key: string;
          timestamp: number;
          instanceId: string;
          service: unknown;
          age: number;
        }[] = [];

        if (currentInstanceId) {
          // Если есть текущий экземпляр - удаляем всех остальных
          instancesToDelete = filteredInstances;
          this.logger.log(
            `🔒 [TIMESTAMP-CLEANUP] Protecting current instance, removing ${instancesToDelete.length} others`
          );
        } else if (filteredInstances.length > 0) {
          // Если нет текущего экземпляра - оставляем самый свежий
          filteredInstances.sort((a, b) => b.timestamp - a.timestamp);
          const freshestInstance = filteredInstances[0];
          instancesToDelete = filteredInstances.slice(1);

          this.logger.log(
            `✨ [TIMESTAMP-CLEANUP] Keeping freshest: ${freshestInstance.instanceId?.substring(0, 8)}... (age: ${Math.floor(freshestInstance.age / 1000)}s)`
          );
        }

        if (instancesToDelete.length > 0) {
          for (const instance of instancesToDelete) {
            this.logger.log(
              `🗑️ [TIMESTAMP-CLEANUP] Removing older: ${instance.key} (age: ${Math.floor(instance.age / 1000)}s, id: ${instance.instanceId?.substring(0, 8)}...)`
            );
          }

          // Удаляем все старые экземпляры
          await Promise.all(
            instancesToDelete.map((instance) => this.redisService.del(instance.key))
          );

          this.logger.log(
            `✅ [TIMESTAMP-CLEANUP] Cleaned up ${instancesToDelete.length} old instances, kept 1 fresh instance of '${serviceName}'`
          );
        } else {
          this.logger.log(
            `🔍 [TIMESTAMP-CLEANUP] Only one instance found for '${serviceName}' - no cleanup needed`
          );
        }
      } else if (keys.length === 1) {
        this.logger.log(
          `🔍 [TIMESTAMP-CLEANUP] Single instance found for '${serviceName}' - no cleanup needed`
        );
      } else {
        this.logger.log(
          `🆕 [TIMESTAMP-CLEANUP] Clean start for service '${serviceName}' - no existing instances`
        );
      }
    } catch (error) {
      this.logger.warn(`❌ [TIMESTAMP-CLEANUP] Failed to cleanup service '${serviceName}':`, error);
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
      // Уменьшаем debug logs для production
    } catch (error) {
      this.logger.warn(
        `⚠️ [NOTIFY] Failed to publish service registration for '${serviceName}':`,
        error
      );
    }
  }

  /**
   * Check if a process is still alive (Node.js only)
   */
  private isProcessAlive(pid: number | string): boolean {
    if (typeof pid !== 'number') return false;

    try {
      // process.kill(pid, 0) checks if process exists without actually killing it
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Register service in the registry with locking to prevent race conditions
   */
  async register(
    registration: Omit<ServiceRegistration, 'instanceId' | 'registeredAt' | 'lastHeartbeat'>
  ): Promise<string> {
    // Если уже есть блокировка для этого сервиса, ждем ее завершения
    const existingLock = ServiceRegistryService.registrationLocks.get(registration.name);
    if (existingLock) {
      this.logger.log(
        `🔒 [REGISTER] Waiting for existing registration lock for service '${registration.name}'`
      );
      await existingLock;
    }

    // Создаем новую блокировку
    const registrationPromise = this.performRegistration(registration);
    const lockPromise = registrationPromise.then(() => undefined);
    ServiceRegistryService.registrationLocks.set(registration.name, lockPromise);

    try {
      return await registrationPromise;
    } finally {
      // Освобождаем блокировку
      ServiceRegistryService.registrationLocks.delete(registration.name);
    }
  }

  /**
   * Acquire distributed lock in Redis
   */
  private async acquireDistributedLock(
    serviceName: string,
    timeoutMs = 10000
  ): Promise<string | null> {
    const lockKey = `${this.config.registryPrefix}:lock:${serviceName}`;
    const lockValue = `${process.pid}:${Date.now()}:${Math.random()}`;
    const lockTtl = Math.ceil(timeoutMs / 1000); // Convert to seconds

    try {
      // Try to set the lock with NX (only if not exists) and EX (expiration)
      await this.redisService.set(lockKey, lockValue, lockTtl);
      this.logger.log(
        `🔐 [LOCK] Acquired distributed lock for service '${serviceName}' (${lockValue})`
      );
      return lockValue;
    } catch (error) {
      this.logger.warn(`❌ [LOCK] Failed to acquire lock for service '${serviceName}':`, error);
      return null;
    }
  }

  /**
   * Release distributed lock in Redis
   */
  private async releaseDistributedLock(serviceName: string, lockValue: string): Promise<void> {
    const lockKey = `${this.config.registryPrefix}:lock:${serviceName}`;

    try {
      // Only delete the lock if it matches our value (to avoid releasing someone else's lock)
      const currentValue = await this.redisService.get(lockKey);
      if (currentValue === lockValue) {
        await this.redisService.del(lockKey);
        this.logger.log(
          `🔓 [LOCK] Released distributed lock for service '${serviceName}' (${lockValue})`
        );
      }
    } catch (error) {
      this.logger.warn(`❌ [LOCK] Failed to release lock for service '${serviceName}':`, error);
    }
  }

  /**
   * Actual registration logic (protected by lock)
   */
  private async performRegistration(
    registration: Omit<ServiceRegistration, 'instanceId' | 'registeredAt' | 'lastHeartbeat'>
  ): Promise<string> {
    const isDevelopment = process.env.NODE_ENV === 'development';

    let lockValue: string | null = null;

    // In development mode, skip distributed locking to avoid infinite retry loops during HMR
    if (!isDevelopment) {
      // Acquire distributed lock to prevent race conditions across processes
      lockValue = await this.acquireDistributedLock(registration.name, 15000);
      if (!lockValue) {
        throw new Error(`Failed to acquire lock for service '${registration.name}' after timeout`);
      }
    } else {
      this.logger.log(`🔓 [REGISTER] Skipping distributed lock in development mode for faster HMR`);
    }

    try {
      this.logger.log(
        `🚀 [REGISTER] Starting registration for service '${registration.name}'${isDevelopment ? ' (HMR Mode)' : ''} (PID: ${process.pid})`
      );

      // Очищаем старые экземпляры этого же сервиса перед регистрацией нового
      await this.cleanupOldInstances(registration.name);

      // В development режиме делаем дополнительную проверку на дубли
      if (isDevelopment) {
        const remainingKeys = await this.redisService.keys(
          `${this.config.registryPrefix}:${registration.name}:*`
        );
        if (remainingKeys.length > 0) {
          this.logger.warn(
            `⚠️ [HMR-WARNING] Found ${remainingKeys.length} remaining instances after cleanup: ${remainingKeys.join(', ')}`
          );
          // Принудительно удаляем их еще раз
          await Promise.all(remainingKeys.map((key) => this.redisService.del(key)));
          this.logger.log(`🔨 [HMR-FORCE] Force-deleted remaining instances`);
        }
      }

      const instanceId = uuidv4();
      const now = new Date().toISOString();
      const timestamp = Date.now();

      const fullRegistration: ServiceRegistration & { registryTimestamp?: number } = {
        ...registration,
        instanceId,
        registeredAt: now,
        lastHeartbeat: now,
        registryTimestamp: timestamp, // Добавляем timestamp для построения ключа
      };

      this.currentRegistration = fullRegistration;

      const registryKey = `${this.config.registryPrefix}:${registration.name}:${timestamp}:${instanceId}`;

      // Store service registration in Redis
      await this.redisService.set(
        registryKey,
        JSON.stringify(fullRegistration),
        this.config.serviceTtl
      );

      this.logger.log(
        `✅ [REGISTER] Service registered: ${registration.name}@${registration.version} (${instanceId}) queue: ${registration.queueName} (PID: ${process.pid})`
      );

      // Уведомляем Gateway о новом сервисе через Redis pub/sub
      await this.notifyServiceRegistration(registration.name);

      // КРИТИЧНО: Сразу после регистрации очищаем дубликаты по timestamp
      await this.forceDuplicateCleanup(registration.name);

      // Start heartbeat
      this.startHeartbeat();

      // В development режиме проверяем, что у нас только один экземпляр
      if (isDevelopment) {
        const finalKeys = await this.redisService.keys(
          `${this.config.registryPrefix}:${registration.name}:*`
        );
        this.logger.log(
          `🔍 [HMR-VERIFY] Total instances after registration: ${finalKeys.length} (PID: ${process.pid})`
        );
      }

      return instanceId;
    } catch (error) {
      this.logger.error('❌ [REGISTER] Failed to register service:', error);
      throw error;
    } finally {
      // Release distributed lock (only if we acquired one)
      if (lockValue) {
        await this.releaseDistributedLock(registration.name, lockValue);
      }
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

      // Убираем verbose debug logs

      const keys = await this.redisService.keys(pattern);

      // Убираем debug log списка ключей

      if (keys.length === 0) {
        // Проверим есть ли вообще какие-то ключи в Redis
        this.logger.warn(`⚠️ No keys found with pattern ${pattern}. Checking all keys...`);
        const allKeys = await this.redisService.keys('*');
        this.logger.debug(
          `📋 Total keys in Redis: ${allKeys.length}, first 10: [${allKeys.slice(0, 10).join(', ')}]`
        );
        return [];
      }

      const services: ServiceRegistration[] = [];

      for (const key of keys) {
        try {
          // Skip lock keys - they are not service registrations
          if (key.includes(':lock:')) {
            // Пропускаем lock ключи без логирования
            continue;
          }

          const data = await this.redisService.get(key);
          if (data) {
            const service = JSON.parse(data) as ServiceRegistration;

            // Игнорируем deprecated сервисы
            if ((service as ServiceRegistration & { deprecated?: boolean }).deprecated) {
              // Пропускаем deprecated сервисы без логирования
              continue;
            }

            services.push(service);
            // Убираем debug логи из цикла
          } else {
            this.logger.warn(`🚫 [discover] No data found for key: ${key}`);
          }
        } catch (error) {
          this.logger.warn(`❌ [discover] Failed to parse service data for key ${key}:`, error);
        }
      }

      this.logger.debug(`📊 [discover] Total services discovered: ${services.length}`);
      return services;
    } catch (error) {
      this.logger.error('❌ [discover] Failed to discover services:', error);
      return [];
    }
  }

  /**
   * Get healthy services by name
   */
  async getHealthyServices(serviceName?: string): Promise<ServiceRegistration[]> {
    const allServices = await this.discover(serviceName);

    // Убираем debug лог health check'а для уменьшения spam'а

    // Фильтруем только здоровые сервисы и проверяем TTL
    const healthyServices: ServiceRegistration[] = [];
    const staleServices: ServiceRegistration[] = [];

    for (const service of allServices) {
      // Проверяем статус и время последнего heartbeat
      const isHealthy = service.status === 'healthy';
      const timeSinceLastHeartbeat = Date.now() - new Date(service.lastHeartbeat).getTime();
      const isRecentHeartbeat = timeSinceLastHeartbeat < this.config.serviceTtl * 1000;

      // Убираем debug логи health check'ов для каждого сервиса

      if (isHealthy && isRecentHeartbeat) {
        healthyServices.push(service);
        // Убираем debug логи healthy статуса
      } else if (!isRecentHeartbeat) {
        staleServices.push(service);
        // Stale сервисы логируем только для важных случаев
      } else {
        // Unhealthy статус логируем только при необходимости
      }
    }

    // Cleanup stale services from Redis if enabled
    if (this.config.enableCleanup && staleServices.length > 0) {
      await this.cleanupStaleServices(staleServices);
    }

    // Убираем debug лог соотношения здоровых сервисов

    return healthyServices;
  }

  /**
   * Clean up stale services from Redis
   */
  private async cleanupStaleServices(staleServices: ServiceRegistration[]): Promise<void> {
    this.logger.debug(`🧹 Cleaning up ${staleServices.length} stale service instances from Redis`);

    const cleanupPromises = staleServices.map(async (service) => {
      const registryKey = `${this.config.registryPrefix}:${service.name}:${service.instanceId}`;
      try {
        await this.redisService.del(registryKey);
        this.logger.debug(`🗑️ Removed stale service: ${service.name}@${service.instanceId}`);
      } catch (error) {
        this.logger.warn(
          `Failed to remove stale service ${service.name}@${service.instanceId}:`,
          error
        );
      }
    });

    await Promise.all(cleanupPromises);
    this.logger.debug(`✅ Stale services cleanup completed`);
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

    // Используем timestamp из registration для построения ключа
    const timestamp = (
      this.currentRegistration as ServiceRegistration & { registryTimestamp?: number }
    ).registryTimestamp;
    if (!timestamp) {
      this.logger.error('🚫 [HEARTBEAT] No registry timestamp found in current registration');
      return;
    }

    const registryKey = `${this.config.registryPrefix}:${this.currentRegistration.name}:${timestamp}:${this.currentRegistration.instanceId}`;

    try {
      // Сначала проверяем, не помечен ли наш ключ как deprecated
      const existingData = await this.redisService.get(registryKey);
      if (existingData) {
        const existingService = JSON.parse(existingData);
        if (existingService.deprecated) {
          this.logger.warn(
            `🚫 [HEARTBEAT] Service ${this.currentRegistration.name} (${this.currentRegistration.instanceId}) is deprecated, stopping heartbeat`
          );
          this.logger.warn(
            `🚫 [HEARTBEAT] Deprecated at: ${existingService.deprecatedAt}, by PID: ${existingService.deprecatedBy}`
          );

          // Останавливаем heartbeat для deprecated экземпляра
          if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
          }

          // Очищаем currentRegistration чтобы не пытаться восстанавливать
          this.currentRegistration = undefined;
          return;
        }
      } else {
        // Если ключ не существует в Redis, проверим есть ли другие экземпляры этого сервиса
        // Это может означать, что наш ключ был удален force cleanup'ом
        const pattern = `${this.config.registryPrefix}:${this.currentRegistration.name}:*`;
        const allServiceKeys = await this.redisService.keys(pattern);

        if (allServiceKeys.length > 0) {
          // Проверяем, есть ли среди существующих ключей наш (с тем же instanceId)
          const ourInstanceId = this.currentRegistration.instanceId;
          const ourKeyExists = allServiceKeys.some((key) => key.includes(ourInstanceId));

          if (!ourKeyExists) {
            // Проверяем backoff для предотвращения циклических перерегистраций
            const now = Date.now();
            if (now - this.lastReregistrationTime < this.reregistrationBackoff) {
              this.logger.warn(
                `⏰ [HEARTBEAT] Skipping re-registration due to backoff (${Math.floor((this.reregistrationBackoff - (now - this.lastReregistrationTime)) / 1000)}s remaining)`
              );
              return;
            }

            this.logger.log(
              `🔄 [HEARTBEAT] Our key was replaced by timestamp cleanup. Re-registering with fresh timestamp...`
            );

            this.lastReregistrationTime = now;
            // Наш ключ был заменен timestamp cleanup'ом - это нормально
            // Просто перерегистрируемся с новым timestamp
            await this.register(this.currentRegistration);
            return;
          } else {
            this.logger.warn(
              `🚫 [HEARTBEAT] Multiple instances with same instanceId detected. Stopping heartbeat.`
            );
            this.logger.warn(
              `🚫 [HEARTBEAT] Existing keys: ${allServiceKeys.slice(0, 3).join(', ')}${allServiceKeys.length > 3 ? '...' : ''}`
            );

            // Останавливаем heartbeat только если реально есть дубликат с тем же instanceId
            if (this.heartbeatTimer) {
              clearInterval(this.heartbeatTimer);
              this.heartbeatTimer = undefined;
            }

            this.currentRegistration = undefined;
            return;
          }
        }
      }

      const now = new Date().toISOString();
      this.currentRegistration.lastHeartbeat = now;

      await this.redisService.set(
        registryKey,
        JSON.stringify(this.currentRegistration),
        this.config.serviceTtl
      );

      // Убираем debug логи heartbeat'ов
    } catch (error) {
      this.logger.error('Failed to send heartbeat:', error);
    }
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

    // Используем timestamp из registration для построения ключа
    const timestamp = (
      this.currentRegistration as ServiceRegistration & { registryTimestamp?: number }
    ).registryTimestamp;
    if (!timestamp) {
      this.logger.error('🚫 [DEREGISTER] No registry timestamp found in current registration');
      return;
    }

    const registryKey = `${this.config.registryPrefix}:${this.currentRegistration.name}:${timestamp}:${this.currentRegistration.instanceId}`;

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
