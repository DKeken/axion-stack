import React, { useState, useEffect } from 'react';

import { useForm, Controller } from 'react-hook-form';

import { Input, Select, SelectItem, Switch, Button, Chip } from '@heroui/react';
import { FiSearch, FiFilter, FiX, FiCheck, FiRotateCcw } from 'react-icons/fi';

import { ICON_SIZES, CAPABILITY_OPTIONS, STATUS_OPTIONS } from './constants';
import { useModelFilters, useProviders, useBreakpoints } from './hooks';

import type { ModelFilters } from './types';

import { useModelsStore } from '~/stores/models-store';

interface ModelFiltersProps {
  externalFilters?: Partial<ModelFilters>;
  hideSearch?: boolean;
  hideCapability?: boolean;
  className?: string;
}

export function ModelFilters({
  externalFilters,
  hideSearch = false,
  hideCapability = false,
  className,
}: ModelFiltersProps) {
  const {
    appliedFilters,
    clearFilters,
    resetPendingFilters,
    hasActiveAppliedFilters,
    hasFilterChanges,
  } = useModelFilters();

  const { setPendingFilters, applyFilters } = useModelsStore();
  const { providers, isLoading: providersLoading } = useProviders();
  const { isMobile } = useBreakpoints();
  const [isExpanded, setIsExpanded] = useState(false);

  // Инициализируем форму с текущими значениями
  const {
    control,
    reset,
    watch,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      search: appliedFilters.search ?? '',
      capability: appliedFilters.capability ?? '',
      provider: appliedFilters.provider ?? '',
      status: appliedFilters.status ?? '',
      isFree: appliedFilters.isFree ?? false,
    },
  });

  // Следим за изменениями формы
  const formValues = watch();

  // Инициализация формы при изменении applied фильтров
  useEffect(() => {
    reset({
      search: appliedFilters.search ?? '',
      capability: appliedFilters.capability ?? '',
      provider: appliedFilters.provider ?? '',
      status: appliedFilters.status ?? '',
      isFree: appliedFilters.isFree ?? false,
    });
  }, [appliedFilters, reset]);

  // Обработчики формы
  const onSubmit = () => {
    // Напрямую передаем значения формы в pending фильтры и применяем
    setPendingFilters(formValues);
    applyFilters();
  };

  const handleResetFilters = () => {
    reset({
      search: appliedFilters.search ?? '',
      capability: appliedFilters.capability ?? '',
      provider: appliedFilters.provider ?? '',
      status: appliedFilters.status ?? '',
      isFree: appliedFilters.isFree ?? false,
    });
    resetPendingFilters();
  };

  const handleClearFilters = () => {
    reset({
      search: '',
      capability: '',
      provider: '',
      status: '',
      isFree: false,
    });
    clearFilters();
  };

  // Определяем есть ли изменения (либо через форму, либо через store)
  const hasChanges = isDirty || hasFilterChanges;

  // Мобильная версия с коллапсируемыми фильтрами
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Поиск всегда видим на мобильных */}
        {!hideSearch && !externalFilters?.search && (
          <Controller
            name='search'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                aria-label='Search models'
                placeholder='Search models...'
                startContent={<FiSearch size={ICON_SIZES.large} />}
                size='sm'
              />
            )}
          />
        )}

        {/* Кнопка фильтров с индикатором активных фильтров */}
        <div className='flex items-center justify-between'>
          <Button
            variant='flat'
            size='sm'
            startContent={<FiFilter size={ICON_SIZES.small} />}
            endContent={
              hasActiveAppliedFilters ? (
                <Chip size='sm' color='primary'>
                  {Object.values(appliedFilters).filter(Boolean).length}
                </Chip>
              ) : null
            }
            onPress={() => setIsExpanded(!isExpanded)}
            className='flex-1'
          >
            Filters
          </Button>

          {hasActiveAppliedFilters && (
            <Button
              variant='light'
              size='sm'
              isIconOnly
              onPress={() => handleClearFilters()}
              className='ml-2'
            >
              <FiX size={ICON_SIZES.medium} />
            </Button>
          )}
        </div>

        {/* Коллапсируемые фильтры */}
        {isExpanded && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className='space-y-3 p-3 bg-default-50 rounded-medium'
          >
            {!hideCapability && !externalFilters?.capability && (
              <Controller
                name='capability'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder='Capability'
                    aria-label='Filter by capability'
                    size='sm'
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      field.onChange(selected || '');
                    }}
                  >
                    {CAPABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.key}>{option.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
            )}

            <Controller
              name='provider'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='Provider'
                  aria-label='Filter by provider'
                  size='sm'
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    field.onChange(selected || '');
                  }}
                  isLoading={providersLoading}
                >
                  {providers.map((provider) => (
                    <SelectItem key={provider.id}>{provider.name}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name='status'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='Status'
                  aria-label='Filter by status'
                  size='sm'
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    field.onChange(selected || '');
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <div className='flex items-center gap-2'>
              <Controller
                name='isFree'
                control={control}
                render={({ field }) => (
                  <Switch
                    size='sm'
                    color='success'
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    classNames={{
                      wrapper: 'p-0 h-4 overflow-visible',
                      thumb: 'w-5 h-5 border-2 shadow-lg',
                    }}
                    startContent={<span className='text-xs'>🆓</span>}
                  >
                    <span className='text-sm text-foreground-600'>Free only</span>
                  </Switch>
                )}
              />
            </div>

            {/* Кнопки управления фильтрами */}
            <div className='flex gap-2 pt-2'>
              <Button
                type='submit'
                variant='solid'
                color='primary'
                size='sm'
                startContent={<FiCheck size={ICON_SIZES.small} />}
                isDisabled={!hasChanges}
                className='flex-1'
              >
                Apply
              </Button>
              <Button
                type='button'
                variant='flat'
                size='sm'
                startContent={<FiRotateCcw size={ICON_SIZES.small} />}
                onPress={handleResetFilters}
                isDisabled={!hasChanges}
              >
                Reset
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Десктопная версия
  return (
    <div className={`space-y-3 ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className='flex flex-col gap-3'
      >
        {/* Основные фильтры */}
        <div className='flex gap-3 flex-wrap'>
          {!hideSearch && !externalFilters?.search && (
            <Controller
              name='search'
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  aria-label='Search models'
                  placeholder='Search models...'
                  startContent={<FiSearch size={ICON_SIZES.large} />}
                  className='max-w-xs'
                />
              )}
            />
          )}

          {!hideCapability && !externalFilters?.capability && (
            <Controller
              name='capability'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='Capability'
                  aria-label='Filter by capability'
                  className='max-w-xs'
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    field.onChange(selected || '');
                  }}
                >
                  {CAPABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
          )}

          <Controller
            name='provider'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder='Provider'
                aria-label='Filter by provider'
                className='max-w-xs'
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  field.onChange(selected || '');
                }}
                isLoading={providersLoading}
              >
                {providers.map((provider) => (
                  <SelectItem key={provider.id}>{provider.name}</SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder='Status'
                aria-label='Filter by status'
                className='max-w-xs'
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  field.onChange(selected || '');
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            )}
          />

          <div className='flex items-center gap-2 px-3'>
            <Controller
              name='isFree'
              control={control}
              render={({ field }) => (
                <Switch
                  size='sm'
                  color='success'
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  classNames={{
                    wrapper: 'p-0 h-4 overflow-visible',
                    thumb: 'w-6 h-6 border-2 shadow-lg',
                  }}
                  startContent={<span className='text-xs'>🆓</span>}
                >
                  <span className='text-sm text-foreground-600 whitespace-nowrap'>Free only</span>
                </Switch>
              )}
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className='flex items-center gap-3'>
          <Button
            type='submit'
            variant='solid'
            color='primary'
            size='sm'
            startContent={<FiCheck size={ICON_SIZES.small} />}
            isDisabled={!hasChanges}
          >
            Apply Filters
          </Button>

          <Button
            type='button'
            variant='flat'
            size='sm'
            startContent={<FiRotateCcw size={ICON_SIZES.small} />}
            onPress={handleResetFilters}
            isDisabled={!hasChanges}
          >
            Reset
          </Button>

          {hasActiveAppliedFilters && (
            <Button
              type='button'
              variant='light'
              size='sm'
              startContent={<FiX size={ICON_SIZES.small} />}
              onPress={handleClearFilters}
            >
              Clear All
            </Button>
          )}

          {hasActiveAppliedFilters && (
            <div className='text-sm text-foreground-600'>
              {Object.values(appliedFilters).filter(Boolean).length} filter
              {Object.values(appliedFilters).filter(Boolean).length !== 1 ? 's' : ''} applied
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
