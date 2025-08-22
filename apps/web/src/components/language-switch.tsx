import { type FC, type Key, useCallback, useMemo } from 'react';

import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Spinner } from '@heroui/spinner';

import { useHydration } from '~/hooks/use-hydration';
import { getLocale, isLocale, type Locale, locales, setLocale } from '~/paraglide/runtime.js';

const getFlag = (code: Locale): string => {
  switch (code) {
    case 'en':
      return '🇺🇸';
    case 'ru':
      return '🇷🇺';
    default:
      return '🌐';
  }
};

const getLabel = (code: Locale): string => {
  switch (code) {
    case 'en':
      return 'English';
    case 'ru':
      return 'Русский';
    default:
      return code;
  }
};

export interface LanguageSwitchProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const LanguageSwitch: FC<LanguageSwitchProps> = ({ className, size = 'md' }) => {
  const isHydrated = useHydration();
  const current = getLocale();

  const handleSelect = useCallback(
    (next: Locale) => {
      if (next === current) return;
      setLocale(next);
    },
    [current]
  );

  const currentFlag = useMemo(() => getFlag(current), [current]);
  const currentLabel = useMemo(() => getLabel(current), [current]);

  const handleAction = useCallback(
    (key: Key) => {
      const next = String(key);
      if (isLocale(next)) {
        handleSelect(next);
      }
    },
    [handleSelect]
  );

  // Prevent Hydration Mismatch
  if (!isHydrated) {
    return (
      <Button size={size} variant='flat' aria-label='Change theme' isIconOnly={size === 'sm'}>
        <Spinner size='sm' color='default' className='w-4 h-4' />
      </Button>
    );
  }

  const triggerContent =
    size === 'sm' ? (
      currentFlag
    ) : (
      <div className='flex items-center gap-2'>
        {currentFlag}
        {currentLabel}
      </div>
    );

  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        <Button size={size} variant='flat' aria-label='Change language' isIconOnly={size === 'sm'}>
          {triggerContent}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Select language'
        selectionMode='single'
        selectedKeys={[current]}
        onAction={handleAction}
      >
        {locales.map((code) => (
          <DropdownItem key={code}>
            <div className='flex items-center gap-2'>
              {getFlag(code)}
              {getLabel(code)}
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
