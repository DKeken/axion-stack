'use client';

import { type FC, useCallback, useMemo } from 'react';

import { Globe } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useHydration } from '~/hooks/use-hydration';
import { cn } from '~/lib/utils';
import { getLocale, type Locale, locales, setLocale } from '~/paraglide/runtime.js';

const getLanguageCode = (code: Locale): string => {
  return code.toUpperCase();
};

export interface LanguageSwitchProps {
  className?: string;
  size?: 'sm' | 'default';
}

export const LanguageSwitch: FC<LanguageSwitchProps> = ({ className, size = 'default' }) => {
  const isHydrated = useHydration();
  const current = getLocale();

  const handleClick = useCallback(() => {
    const currentIndex = locales.indexOf(current);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];
    setLocale(nextLocale);
  }, [current]);

  const currentCode = useMemo(() => getLanguageCode(current), [current]);

  if (!isHydrated) {
    return (
      <Button
        aria-label='Change language'
        className={cn('border-none !h-8', className)}
        size={size}
        variant='outline'
      >
        <div className='bg-muted rounded animate-pulse w-4 h-4' />
      </Button>
    );
  }

  return (
    <Button
      aria-label='Change language'
      className={cn('border-none !h-8', className)}
      size={size}
      variant='outline'
      onClick={handleClick}
    >
      <div className='flex items-center gap-2'>
        <Globe className='h-4 w-4' />
        <div>{currentCode}</div>
      </div>
    </Button>
  );
};
