import { type FC, useMemo } from 'react';

import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Spinner } from '@heroui/spinner';
import { useTheme } from 'next-themes';

import { useHydration } from '~/hooks/use-hydration';

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
  size?: 'sm' | 'md';
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, size = 'md' }) => {
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
      <Button size={size} variant='flat' aria-label='Change theme' isIconOnly={size === 'sm'}>
        <Spinner size='sm' color='default' className='w-4 h-4' />
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
    <Dropdown className={className}>
      <DropdownTrigger>
        <Button size={size} variant='flat' aria-label='Change theme' isIconOnly={size === 'sm'}>
          {triggerContent}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Select theme'
        selectionMode='single'
        selectedKeys={[currentTheme]}
        onAction={(key) => {
          const selectedTheme = String(key) as 'light' | 'dark';
          handleThemeChange(selectedTheme);
        }}
      >
        <DropdownItem key='light'>
          <div className='flex items-center gap-2'>☀️ Light</div>
        </DropdownItem>
        <DropdownItem key='dark'>
          <div className='flex items-center gap-2'>🌙 Dark</div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
