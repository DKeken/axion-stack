'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { Search, ChevronDown } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

export interface SearchableSelectOption {
  id: string;
  label: string;
  value: string;
  name?: string;
  symbol?: string;
  prefix?: string | null;
  [key: string]: unknown;
}

export interface SearchableSelectProps<T extends SearchableSelectOption> {
  options: T[];
  value?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string | React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  disabledChevron?: boolean;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'default';
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (option: T | null) => React.ReactNode;
  filterFunction?: (option: T, searchQuery: string) => boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
}

const defaultFilterFunction = <T extends SearchableSelectOption>(
  option: T,
  searchQuery: string
): boolean => {
  return option.label.toLowerCase().includes(searchQuery.toLowerCase());
};

export const SearchableSelect = <T extends SearchableSelectOption>({
  options,
  value,
  onChange,
  placeholder = 'Выберите значение',
  searchPlaceholder = 'Поиск...',
  label,
  disabled = false,
  loading = false,
  disabledChevron = false,
  className,
  buttonClassName,
  size = 'default',
  renderOption,
  renderValue,
  filterFunction = defaultFilterFunction,
  emptyMessage = 'Нет доступных опций',
  noResultsMessage = 'Ничего не найдено',
}: SearchableSelectProps<T>): React.ReactElement => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || null;
  }, [options, value]);

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    return options.filter((option) => filterFunction(option, searchQuery));
  }, [options, searchQuery, filterFunction]);

  const handleOptionSelect = useCallback(
    (option: T | null) => {
      onChange(option?.value || null);
      setSearchQuery(''); // Очищаем поиск после выбора
      setIsOpen(false);
    },
    [onChange]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery(''); // Очищаем поиск при закрытии меню
    } else {
      // Фокусируем инпут при открытии меню
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Принудительно сохраняем фокус
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Предотвращаем закрытие меню при навигации клавишами
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Можно добавить логику навигации по списку опций
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
      setIsOpen(false);
    }
  }, []);

  const handleSearchMouseDown = useCallback((e: React.MouseEvent) => {
    // Предотвращаем потерю фокуса при клике на инпут
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Рендер значения по умолчанию
  const defaultRenderValue = useCallback(
    (option: T | null) => {
      if (!option) {
        return <span className='text-muted-foreground'>{placeholder}</span>;
      }
      return <span>{option.label}</span>;
    },
    [placeholder]
  );

  // Рендер опции по умолчанию
  const defaultRenderOption = useCallback((option: T) => {
    return <span>{option.label}</span>;
  }, []);

  const triggerContent = (renderValue || defaultRenderValue)(selectedOption);

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className='text-sm font-medium text-muted-foreground mb-2 block'>{label}</label>
        )}
        <Button
          disabled
          className={cn('w-full justify-between', size === 'sm' ? 'h-8 px-2 text-xs' : 'h-10 px-3')}
          size={size}
          variant='outline'
        >
          <div className='bg-muted rounded animate-pulse w-4 h-4' />
          <ChevronDown className='h-4 w-4 opacity-50' />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(buttonClassName, 'w-full justify-between')}
          disabled={disabled}
          size={size}
          variant='outline'
        >
          {triggerContent}
          {!disabledChevron && <ChevronDown className='h-4 w-4 opacity-50' />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56 max-h-72 overflow-hidden z-[999999]'>
        {options.length === 0 ? (
          <div className='px-2 py-3 text-xs text-muted-foreground text-center'>{emptyMessage}</div>
        ) : (
          <>
            <div className='p-2 border-b'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground' />
                <Input
                  ref={searchInputRef}
                  className='h-8 text-xs pl-7'
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onMouseDown={handleSearchMouseDown}
                />
              </div>
            </div>
            <div className='max-h-48 overflow-y-auto'>
              {filteredOptions.length === 0 ? (
                <div className='px-2 py-3 text-xs text-muted-foreground text-center'>
                  {noResultsMessage}
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      className={cn(
                        'flex items-center gap-3 cursor-pointer',
                        selectedOption?.id === option.id ? 'bg-accent' : ''
                      )}
                      onSelect={() => handleOptionSelect(option)}
                    >
                      {(renderOption || defaultRenderOption)(option)}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
