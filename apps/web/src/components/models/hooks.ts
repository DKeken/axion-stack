import { useMemo } from 'react';

import { TABLE_LIMITS, MODEL_LIMITS } from './constants';
import { buildQueryParams } from './utils';

import { useWindowSize } from '~/hooks/use-window-size';
import { apiClient } from '~/lib/api-client';
import { useModelsStore } from '~/stores/models-store';

/**
 * Хук для работы со списком моделей
 */
export function useModels(variant: 'registry' | 'palette' = 'registry') {
  const { appliedFilters, sorting, pagination } = useModelsStore();

  // Определяем лимит в зависимости от варианта использования
  const limit = variant === 'palette' ? MODEL_LIMITS.minimal : pagination.limit;

  // Строим параметры запроса
  const queryParams = useMemo(() => {
    return buildQueryParams(appliedFilters, sorting, { ...pagination, limit });
  }, [appliedFilters, sorting, pagination, limit]);

  // Загружаем данные
  const modelsQuery = apiClient.models.list.useQuery(['models', 'list', variant, queryParams], {
    query: queryParams,
  });

  const models = modelsQuery.data?.body.items || [];
  const total = modelsQuery.data?.body.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    models,
    total,
    totalPages,
    isLoading: modelsQuery.isLoading,
    error: modelsQuery.error,
    refetch: modelsQuery.refetch,
  };
}

/**
 * Хук для работы с провайдерами
 */
export function useProviders() {
  const providersQuery = apiClient.models.providers.list.useQuery(['models', 'providers', 'list'], {
    query: { limit: TABLE_LIMITS.providers },
  });

  return {
    providers: providersQuery.data?.body.items || [],
    isLoading: providersQuery.isLoading,
    error: providersQuery.error,
  };
}

/**
 * Хук для управления фильтрами моделей
 */
export function useModelFilters() {
  const {
    appliedFilters,
    pendingFilters,
    setPendingFilters,
    applyFilters,
    clearFilters,
    resetPendingFilters,
    hasFilterChanges,
    resetPagination,
  } = useModelsStore();

  const updatePendingFilter = (key: string, value: string | boolean | undefined) => {
    setPendingFilters({ [key]: value });
  };

  const removePendingFilter = (key: string) => {
    setPendingFilters({ [key]: undefined });
  };

  const hasActivePendingFilters = Object.values(pendingFilters).some((value) => Boolean(value));
  const hasActiveAppliedFilters = Object.values(appliedFilters).some((value) => Boolean(value));

  return {
    // Состояние фильтров
    appliedFilters,
    pendingFilters,

    // Работа с pending фильтрами
    updatePendingFilter,
    removePendingFilter,

    // Применение и сброс
    applyFilters,
    clearFilters,
    resetPendingFilters,

    // Утилиты
    hasActivePendingFilters,
    hasActiveAppliedFilters,
    hasFilterChanges: hasFilterChanges(),
    resetPagination,
  };
}

/**
 * Хук для управления сортировкой моделей
 */
export function useModelSorting() {
  const { sorting, setSorting } = useModelsStore();

  const updateSorting = (column: string, direction: 'ascending' | 'descending') => {
    setSorting({ column, direction });
  };

  const toggleSortDirection = (column: string) => {
    if (sorting.column === column) {
      const newDirection = sorting.direction === 'ascending' ? 'descending' : 'ascending';
      setSorting({ column, direction: newDirection });
    } else {
      setSorting({ column, direction: 'ascending' });
    }
  };

  return {
    sorting,
    updateSorting,
    toggleSortDirection,
  };
}

/**
 * Хук для управления пагинацией
 */
export function useModelPagination() {
  const { pagination, setPagination, resetPagination } = useModelsStore();

  const setPage = (page: number) => {
    setPagination({ page });
  };

  const setLimit = (limit: number) => {
    setPagination({ limit, page: 1 }); // Сброс на первую страницу при изменении лимита
  };

  return {
    pagination,
    setPage,
    setLimit,
    resetPagination,
  };
}

/**
 * Хук для управления выбранной моделью
 */
export function useModelSelection() {
  const { selectedModelId, setSelectedModel } = useModelsStore();

  const selectModel = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const clearSelection = () => {
    setSelectedModel(undefined);
  };

  const isSelected = (modelId: string) => {
    return selectedModelId === modelId;
  };

  return {
    selectedModelId,
    selectModel,
    clearSelection,
    isSelected,
  };
}

/**
 * Хук для определения размера экрана и мобильных устройств
 */
export function useBreakpoints() {
  const { width } = useWindowSize();

  return useMemo(
    () => ({
      isMobile: width ? width < 768 : false,
      isTablet: width ? width >= 768 && width < 1024 : false,
      isDesktop: width ? width >= 1024 : true, // по умолчанию считаем desktop для SSR
      isLarge: width ? width >= 1280 : false,
    }),
    [width]
  );
}
