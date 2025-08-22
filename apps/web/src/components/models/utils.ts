import type { ModelData, ModelFilters, ModelSorting } from './types';
import type { Prisma } from '@repo/database';

/**
 * Форматирует контекстную длину модели в читаемый вид
 */
export function formatContextLength(contextLength?: number | null): string {
  if (!contextLength) return '—';

  if (contextLength >= 1000000) {
    return `${(contextLength / 1000000).toFixed(1)}M`;
  }

  if (contextLength >= 1000) {
    return `${(contextLength / 1000).toFixed(0)}K`;
  }

  return contextLength.toString();
}

/**
 * Форматирует стоимость модели за 1K токенов
 */
export function formatModelCost(cost?: number | null): string {
  if (!cost) return '—';

  if (cost < 0.000001) {
    return `$${(cost * 1000000).toFixed(2)}µ`;
  }

  if (cost < 0.001) {
    return `$${(cost * 1000).toFixed(2)}m`;
  }

  return `$${cost.toFixed(6)}`;
}

/**
 * Конвертирует цену в number из различных типов
 */
export function convertPriceToNumber(price: string | number | Prisma.Decimal): number {
  if (typeof price === 'string') {
    return parseFloat(price);
  }
  if (typeof price === 'number') {
    return price;
  }
  // Decimal type
  if (typeof price === 'object' && 'toNumber' in price) {
    return price.toNumber();
  }
  return Number(price);
}

/**
 * Форматирует стоимость модели за 1M токенов
 */
export function formatModelCostPer1M(costPer1K?: string | number | Prisma.Decimal | null): string {
  if (!costPer1K) return '—';

  // Конвертируем цену за 1K в number и затем в цену за 1M (умножаем на 1000)
  const costPer1KNumber = convertPriceToNumber(costPer1K);
  const costPer1M = costPer1KNumber * 1000;

  if (costPer1M < 0.01) {
    return `$${costPer1M.toFixed(6)}`;
  }

  if (costPer1M < 1) {
    return `$${costPer1M.toFixed(3)}`;
  }

  if (costPer1M < 100) {
    return `$${costPer1M.toFixed(2)}`;
  }

  return `$${costPer1M.toFixed(0)}`;
}

/**
 * Получает первые буквы названия для аватара
 */
export function getModelInitials(name: string, providerName?: string): string {
  if (providerName) {
    return providerName.slice(0, 2).toUpperCase();
  }

  const words = name.split(' ').filter((word) => word.length > 0);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

/**
 * Проверяет, является ли модель бесплатной
 */
export function isModelFree(model: ModelData): boolean {
  return (
    model.isFree === true ||
    (!model.inputCost && !model.outputCost) ||
    (!model.ourInputPricePer1k && !model.ourOutputPricePer1k)
  );
}

/**
 * Строит параметры запроса для API
 */
export function buildQueryParams(
  filters: ModelFilters,
  sorting: ModelSorting,
  pagination: { page: number; limit: number }
) {
  const params: Record<string, any> = {
    limit: pagination.limit,
    offset: (pagination.page - 1) * pagination.limit,
  };

  // Сортировка
  if (sorting.column) {
    params.sort = [`${sorting.column}:${sorting.direction === 'ascending' ? 'asc' : 'desc'}`];
  }

  // Поиск
  if (filters.search) {
    params.q = filters.search;
  }

  // Фильтры
  const apiFilters: Record<string, any> = {};

  if (filters.capability) {
    apiFilters.capabilities = { contains: filters.capability };
  }

  if (filters.provider) {
    apiFilters.providerId = filters.provider;
  }

  if (filters.status) {
    apiFilters.status = filters.status;
  }

  if (typeof filters.isFree === 'boolean') {
    apiFilters.isFree = filters.isFree;
  }

  if (Object.keys(apiFilters).length > 0) {
    params.filter = apiFilters;
  }

  return params;
}

/**
 * Валидация модели
 */
export function validateModel(model: unknown): model is ModelData {
  if (!model || typeof model !== 'object') return false;

  const m = model as Record<string, unknown>;

  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.providerId === 'string' &&
    typeof m.status === 'string'
  );
}
