/**
 * Contract Discovery Service
 * Интегрирует NestJS Discovery Service с ts-rest контрактами
 * Автоматически обнаруживает и валидирует MessagePattern в микросервисах
 */

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { getServiceCapabilities, validateServiceRoutes } from '@repo/contracts';

@Injectable()
export class ContractDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(ContractDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector
  ) {}

  async onModuleInit(): Promise<void> {
    const serviceName = this.getServiceName();
    if (!serviceName) {
      this.logger.warn('🚫 Service name not found in environment variables');
      return;
    }

    this.logger.log(`🔍 Discovering MessagePatterns for service: ${serviceName}`);

    // Получаем все MessagePattern из текущего микросервиса
    const discoveredPatterns = this.discoverMessagePatterns();

    // Получаем ожидаемые patterns из ts-rest контрактов
    const expectedPatterns = getServiceCapabilities(serviceName);

    // Валидируем соответствие
    const validation = validateServiceRoutes(serviceName, discoveredPatterns);

    this.logValidationResults(serviceName, validation, expectedPatterns, discoveredPatterns);

    if (!validation.valid) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('⚠️ Contract validation failed, but continuing in development mode');
      } else {
        throw new Error(`Contract validation failed for service: ${serviceName}`);
      }
    }
  }

  /**
   * Обнаруживает все MessagePattern декораторы в текущем приложении
   */
  private discoverMessagePatterns(): string[] {
    const patterns: string[] = [];

    // Получаем все providers и controllers с MessagePattern
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();

    this.logger.debug(
      `🔍 Scanning ${providers.length} providers and ${controllers.length} controllers for MessagePatterns`
    );

    // Сканируем как providers, так и controllers
    const allItems = [...providers, ...controllers];

    allItems.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') return;

      const constructorName = instance.constructor.name;

      // Skip non-controller classes to reduce noise
      if (!constructorName.includes('Controller') && !constructorName.includes('Service')) {
        return;
      }

      this.logger.debug(`🔍 Scanning ${constructorName} for MessagePatterns`);

      // Сканируем методы класса
      const methodNames = this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (methodName) => methodName
      );

      methodNames.forEach((methodName) => {
        const method = instance[methodName];
        if (!method || typeof method !== 'function') return;

        // Ищем MessagePattern metadata (используем правильный NestJS ключ)
        const messagePattern = this.reflector.get<string>(PATTERN_METADATA, method);

        // Также попробуем получить все метаданные для отладки (всегда в development)
        if (constructorName.includes('Controller')) {
          const allMetadata = Reflect.getMetadataKeys(method);
          const metadataKeysStr = allMetadata?.map((key) => String(key)).join(', ') || 'none';
          this.logger.debug(
            `📊 Method ${constructorName}.${methodName}: metadata keys=[${metadataKeysStr}]`
          );

          // Попробуем разные ключи метаданных
          const possibleKeys = [
            PATTERN_METADATA,
            'microservices:pattern_metadata',
            'microservices:pattern',
          ];
          for (const key of possibleKeys) {
            const metadata = this.reflector.get<string>(key, method);
            if (metadata) {
              this.logger.debug(`🎯 Found pattern with key '${key}': ${metadata}`);
            }
          }
        }

        if (messagePattern) {
          patterns.push(messagePattern);
          this.logger.debug(
            `📡 Found MessagePattern: ${messagePattern} in ${constructorName}.${methodName}`
          );
        }
      });
    });

    // Убираем дубликаты и фильтруем пустые значения
    const flattenedPatterns = patterns.flat().filter(Boolean);
    const uniquePatterns = [...new Set(flattenedPatterns)];

    this.logger.debug(`🎯 Final discovered patterns: [${uniquePatterns.join(', ')}]`);

    return uniquePatterns;
  }

  /**
   * Получает имя сервиса из переменных окружения
   */
  private getServiceName(): string | null {
    return process.env.SERVICE_NAME || null;
  }

  /**
   * Логирует результаты валидации
   */
  private logValidationResults(
    serviceName: string,
    validation: ReturnType<typeof validateServiceRoutes>,
    expectedPatterns: string[],
    discoveredPatterns: string[]
  ): void {
    this.logger.log(`📊 Contract validation for service '${serviceName}':`);
    this.logger.log(`   Expected patterns: [${expectedPatterns.join(', ')}]`);
    this.logger.log(`   Discovered patterns: [${discoveredPatterns.join(', ')}]`);

    if (validation.valid) {
      this.logger.log('✅ All contracts are properly implemented!');
    } else {
      if (validation.missing.length > 0) {
        this.logger.error(`❌ Missing implementations: [${validation.missing.join(', ')}]`);
      }
      if (validation.extra.length > 0) {
        this.logger.warn(
          `⚠️ Extra implementations (not in contract): [${validation.extra.join(', ')}]`
        );
      }
    }
  }

  /**
   * Получает список всех обнаруженных MessagePattern для использования в Service Registry
   */
  getDiscoveredCapabilities(): string[] {
    return this.discoverMessagePatterns();
  }
}
