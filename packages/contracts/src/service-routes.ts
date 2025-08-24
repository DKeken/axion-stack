/**
 * Service Routes Generator from ts-rest contracts
 * Single Source of Truth для маршрутизации в микросервисной архитектуре
 */

// Скопировано из @repo/common для избежания NestJS зависимостей в фронтенде
function getApiPrefix(): string {
  return process.env.API_PREFIX || '/api/v1';
}

function normalizeApiPath(fullPath: string, serviceName: string): string {
  const prefix = getApiPrefix();
  const servicePrefix = `${prefix}/${serviceName}`;

  if (fullPath.startsWith(servicePrefix)) {
    const relativePath = fullPath.substring(servicePrefix.length);
    return relativePath || '/';
  }

  return fullPath;
}
import type { AppRoute, AppRouter } from '@ts-rest/core';

import { apiContract } from './index';

export interface ServiceRouteConfig {
  serviceName: string;
  routes: RoutePattern[];
}

export interface RoutePattern {
  method: string;
  pathPattern: string;
  messagePattern: string;
  description?: string;
}

/**
 * Извлекает маршруты из ts-rest контрактов
 * Автоматически генерирует ServiceRouteConfig на основе ApiContract
 */
export function getServiceRoutesFromContracts(): ServiceRouteConfig[] {
  const routes: ServiceRouteConfig[] = [];

  // Обрабатываем каждый сервис в apiContract
  Object.entries(apiContract).forEach(([serviceName, serviceContract]) => {
    if (typeof serviceContract === 'object' && serviceContract !== null) {
      const serviceRoutes = extractRoutesFromContract(serviceContract as AppRouter, serviceName);

      if (serviceRoutes.length > 0) {
        routes.push({
          serviceName,
          routes: serviceRoutes,
        });
      }
    }
  });

  return routes;
}

/**
 * Рекурсивно извлекает маршруты из ts-rest контракта
 */
function extractRoutesFromContract(contract: AppRouter, serviceName: string): RoutePattern[] {
  const routes: RoutePattern[] = [];

  Object.entries(contract).forEach(([routeName, route]) => {
    if (isAppRoute(route)) {
      // Это конечный маршрут
      // Обрезаем префикс API чтобы получить относительный путь
      const pathPattern = normalizeApiPath(route.path, serviceName);

      const routePattern: RoutePattern = {
        method: route.method.toUpperCase(),
        pathPattern,
        messagePattern: `${serviceName}.${routeName}`,
        description: route.summary || `${serviceName} ${routeName} endpoint`,
      };

      routes.push(routePattern);
    } else if (typeof route === 'object' && route !== null) {
      // Это вложенный роутер - рекурсивно обрабатываем
      const nestedRoutes = extractRoutesFromContract(route, serviceName);
      routes.push(...nestedRoutes);
    }
  });

  return routes;
}

/**
 * Type guard для определения AppRoute
 */
function isAppRoute(obj: unknown): obj is AppRoute {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'method' in obj &&
    'path' in obj &&
    typeof (obj as AppRoute).method === 'string' &&
    typeof (obj as AppRoute).path === 'string'
  );
}

/**
 * Получает список capabilities для конкретного сервиса
 * Используется для регистрации в Service Discovery
 */
export function getServiceCapabilities(serviceName: string): string[] {
  const serviceRoutes = getServiceRoutesFromContracts().find(
    (service) => service.serviceName === serviceName
  );

  return serviceRoutes?.routes.map((route) => route.messagePattern) || [];
}

/**
 * Получает конфигурацию маршрутов для конкретного сервиса
 */
export function getServiceRouteConfig(serviceName: string): ServiceRouteConfig | null {
  return (
    getServiceRoutesFromContracts().find((service) => service.serviceName === serviceName) || null
  );
}

/**
 * Валидирует что все маршруты из контракта имеют соответствующие MessagePattern в микросервисе
 */
export function validateServiceRoutes(
  serviceName: string,
  availablePatterns: string[]
): {
  valid: boolean;
  missing: string[];
  extra: string[];
} {
  const expectedPatterns = getServiceCapabilities(serviceName);

  // Список стандартных служебных паттернов, которые есть у всех микросервисов
  const commonServicePatterns = ['health.check'];

  // Все разрешенные паттерны = API паттерны + служебные паттерны
  const allowedPatterns = [...expectedPatterns, ...commonServicePatterns];

  // Убираем дубликаты из входных данных
  const uniqueAvailable = [...new Set(availablePatterns)];
  const uniqueExpected = [...new Set(expectedPatterns)];

  const missing = uniqueExpected.filter((pattern) => !uniqueAvailable.includes(pattern));
  const extra = uniqueAvailable.filter((pattern) => !allowedPatterns.includes(pattern));

  return {
    valid: missing.length === 0, // Важно только отсутствие обязательных паттернов
    missing,
    extra,
  };
}
