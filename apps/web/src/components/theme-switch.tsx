'use client';

import { type FC, useMemo } from 'react';

import { useTheme } from 'next-themes';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useHydration } from '~/hooks/use-hydration';
import { cn } from '~/lib/utils';

const getThemeIcon = (theme: 'light' | 'dark') => {
  switch (theme) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
  }
};

const getThemeLabel = (theme: 'light' | 'dark'): string => {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
  }
};

export interface ThemeSwitchProps {
  className?: string;
  size?: 'sm' | 'default';
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, size = 'default' }) => {
  const isHydrated = useHydration();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const currentTheme: 'light' | 'dark' = useMemo(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      return resolvedTheme;
    }

    if (theme === 'light' || theme === 'dark') {
      return theme;
    }

    return 'light';
  }, [resolvedTheme, theme]);

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    if (selectedTheme === currentTheme) return;
    setTheme(selectedTheme);
  };

  // Prevent Hydration Mismatch
  if (!isHydrated) {
    return (
      <Button
        aria-label='Change theme'
        className={size === 'sm' ? 'w-8 h-8 p-0' : ''}
        size={size}
        variant='outline'
      >
        <div className='bg-muted rounded animate-pulse w-4 h-4' />
      </Button>
    );
  }

  const triggerContent =
    size === 'sm' ? (
      getThemeIcon(currentTheme)
    ) : (
      <div className='flex items-center gap-2'>
        {getThemeIcon(currentTheme)}
        {getThemeLabel(currentTheme)}
      </div>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Change theme'
          className={cn(size === 'sm' ? 'w-8 h-8 p-0' : '', className)}
          size={size}
          variant='outline'
        >
          {triggerContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          className={currentTheme === 'light' ? 'bg-accent' : ''}
          onClick={() => handleThemeChange('light')}
        >
          <div className='flex items-center gap-2'>☀️ Light</div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentTheme === 'dark' ? 'bg-accent' : ''}
          onClick={() => handleThemeChange('dark')}
        >
          <div className='flex items-center gap-2'>🌙 Dark</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
