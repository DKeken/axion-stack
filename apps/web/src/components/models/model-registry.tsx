import React, { useCallback, useEffect } from 'react';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  type SortDescriptor,
} from '@heroui/react';
import { FiCheck } from 'react-icons/fi';

import { ICON_SIZES } from './constants';
import {
  useModels,
  useModelSorting,
  useModelPagination,
  useModelSelection,
  useBreakpoints,
} from './hooks';
import { ModelFilters } from './model-filters';
import { ModelTableCell } from './model-table-cell';
import { getModelInitials, isModelFree, formatModelCostPer1M } from './utils';

import type { ModelRegistryProps, ModelData, ModelTableColumn } from './types';

export function ModelRegistry({
  onModelSelect,
  selectedModelId: externalSelectedModelId,
  searchQuery: externalSearchQuery,
  typeFilter: externalTypeFilter,
  className,
  externalPagination = false,
  onPaginationChange,
}: ModelRegistryProps) {
  // Используем хуки для управления состоянием
  const { models, total, totalPages, isLoading, error } = useModels('registry');
  const { sorting, toggleSortDirection } = useModelSorting();
  const { pagination, setPage } = useModelPagination();
  const { selectedModelId, selectModel } = useModelSelection();
  const { isMobile, isTablet } = useBreakpoints();

  // Используем внешний выбранный modelId если он передан
  const currentSelectedModelId = externalSelectedModelId ?? selectedModelId;

  // Синхронизируем внешний выбор с внутренним состоянием
  useEffect(() => {
    if (externalSelectedModelId && externalSelectedModelId !== selectedModelId) {
      selectModel(externalSelectedModelId);
    }
  }, [externalSelectedModelId, selectedModelId, selectModel]);

  // Передаем данные пагинации наружу, если используется внешняя пагинация
  useEffect(() => {
    if (externalPagination && onPaginationChange) {
      onPaginationChange({
        page: pagination.page,
        total,
        totalPages,
      });
    }
  }, [externalPagination, onPaginationChange, pagination.page, total, totalPages]);

  const columns: ModelTableColumn[] = [
    { key: 'name', label: 'Model', sortable: true },
    { key: 'provider', label: 'Provider', sortable: false },
    { key: 'capabilities', label: 'Capabilities', sortable: false },
    { key: 'contextLength', label: 'Context', sortable: true },
    { key: 'cost', label: 'Cost', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];
  const handleModelSelect = useCallback(
    (modelId: string) => {
      selectModel(modelId);
      onModelSelect?.(modelId);
    },
    [selectModel, onModelSelect]
  );

  const renderCell = useCallback(
    (model: ModelData, columnKey: string | number): React.ReactNode => {
      return (
        <ModelTableCell
          model={model}
          columnKey={columnKey}
          selectedModelId={currentSelectedModelId}
          onModelSelect={handleModelSelect}
        />
      );
    },
    [currentSelectedModelId, handleModelSelect]
  );

  const onSortChange = (descriptor: SortDescriptor) => {
    if (descriptor.column) {
      toggleSortDirection(descriptor.column as string);
    }
  };

  // Преобразуем состояние сортировки в формат NextUI
  const sortDescriptor: SortDescriptor = {
    column: sorting.column ?? 'name',
    direction: sorting.direction ?? 'ascending',
  };

  const topContent = (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex justify-between items-start gap-3'>
        <ModelFilters
          externalFilters={{
            search: externalSearchQuery,
            capability: externalTypeFilter,
          }}
          hideSearch={Boolean(externalSearchQuery)}
          hideCapability={Boolean(externalTypeFilter)}
        />

        <div className='flex items-center gap-2 text-sm text-foreground-500'>
          <span>Total: {total} models</span>
        </div>
      </div>
    </div>
  );

  const bottomContent = externalPagination ? null : (
    <div className='flex justify-center items-center p-4'>
      {totalPages > 1 && (
        <Pagination
          page={pagination.page}
          total={totalPages}
          onChange={setPage}
          showControls
          showShadow
          color='primary'
          size={isMobile ? 'sm' : 'md'}
        />
      )}
    </div>
  );

  // Мобильный компонент карточки модели
  const ModelCard = ({ model }: { model: ModelData }) => (
    <Card
      className={`cursor-pointer transition-all hover:scale-[1.02] ${
        currentSelectedModelId === model.id ? 'ring-2 ring-primary' : ''
      }`}
      onPress={() => handleModelSelect(model.id)}
      isPressable
    >
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded bg-content2 flex items-center justify-center text-xs font-bold text-content2-foreground'>
              {getModelInitials(model.name, model.provider?.name ?? model.providerId)}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-sm truncate'>{model.name}</p>
              <p className='text-xs text-foreground-500 truncate'>
                {model.provider?.name ?? model.providerId}
              </p>
            </div>
          </div>
          {currentSelectedModelId === model.id && (
            <div className='text-primary'>
              <FiCheck size={ICON_SIZES.medium} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className='pt-0 space-y-2'>
        <div className='flex items-center gap-1 flex-wrap'>
          {model.capabilities?.slice(0, 3).map((cap) => (
            <span key={cap} className='text-xs px-2 py-1 bg-default-100 rounded-full'>
              {cap}
            </span>
          ))}
          {isModelFree(model) && (
            <span className='text-xs px-2 py-1 bg-success-100 text-success-700 rounded-full font-medium'>
              Free
            </span>
          )}
        </div>
        <div className='space-y-1'>
          {model.contextLength && (
            <p className='text-xs text-foreground-500'>
              Context: {model.contextLength.toLocaleString()}
            </p>
          )}
          {!isModelFree(model) && (model.ourInputPricePer1k ?? model.ourOutputPricePer1k) && (
            <div className='text-xs text-foreground-500'>
              <div className='flex gap-2'>
                {model.ourInputPricePer1k && (
                  <span>In: {formatModelCostPer1M(model.ourInputPricePer1k)}/1M</span>
                )}
                {model.ourOutputPricePer1k && (
                  <span>Out: {formatModelCostPer1M(model.ourOutputPricePer1k)}/1M</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className='text-center'>
          <p className='text-danger mb-2'>Failed to load models</p>
          <p className='text-sm text-foreground-500'>
            {'message' in error ? String(error.message) : 'An error occurred while fetching models'}
          </p>
        </div>
      </div>
    );
  }

  // Мобильная версия с карточками
  if (isMobile || isTablet) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {topContent}

        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='grid gap-3 p-4'>
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className='h-32'>
                  <CardBody className='flex items-center justify-center'>
                    <Spinner size='sm' />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-foreground-500'>No models found</p>
            </div>
          ) : (
            <div className='grid gap-3 p-4'>
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </div>

        {!externalPagination && bottomContent}
      </div>
    );
  }

  // Десктопная версия с таблицей
  return (
    <div className={className}>
      <Table
        aria-label='Models registry table'
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        topContent={topContent}
        bottomContent={bottomContent}
        classNames={{
          wrapper: 'max-h-[70vh]',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.sortable}
              className={column.key === 'actions' ? 'text-center' : ''}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={models}
          isLoading={isLoading}
          loadingContent={<Spinner label='Loading models...' />}
          emptyContent='No models found'
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Экспортируем компонент пагинации для использования снаружи
export function ModelRegistryPagination() {
  const { pagination, setPage } = useModelPagination();
  const { totalPages } = useModels('registry');
  const { isMobile } = useBreakpoints();

  if (totalPages <= 1) return null;

  return (
    <div className='flex justify-center p-4'>
      <Pagination
        page={pagination.page}
        total={totalPages}
        onChange={setPage}
        showControls={!isMobile}
        showShadow
        color='primary'
        size={isMobile ? 'sm' : 'md'}
        className={isMobile ? 'text-xs' : ''}
      />
    </div>
  );
}
