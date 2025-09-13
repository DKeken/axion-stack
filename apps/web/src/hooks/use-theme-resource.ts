'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { useHydration } from './use-hydration';

export interface ThemeResourceOptions {
  /**
   * Ресурс для светлой темы
   */
  light: string;
  /**
   * Ресурс для темной темы
   */
  dark: string;
  /**
   * Ресурс по умолчанию до гидрации (обычно светлый)
   */
  fallback?: string;
}

/**
 * Хук для безопасного получения ресурсов в зависимости от темы.
 * Предотвращает мерцание при гидрации.
 *
 * @param options - Опции с ресурсами для разных тем
 * @returns Текущий ресурс и флаг гидрации
 */
export function useThemeResource(options: ThemeResourceOptions) {
  const isHydrated = useHydration();
  const { resolvedTheme, theme } = useTheme();

  const resource = useMemo(() => {
    // До гидрации используем fallback или light
    if (!isHydrated) {
      return options.fallback ?? options.light;
    }

    // После гидрации используем актуальную тему
    const currentTheme = resolvedTheme || theme;

    if (currentTheme === 'dark') {
      return options.dark;
    }

    return options.light;
  }, [isHydrated, resolvedTheme, theme, options]);

  return {
    resource,
    isHydrated,
  };
}

/**
 * Хук для безопасного получения темы без мерцания при гидрации.
 *
 * @returns Объект с текущей темой и флагом гидрации
 */
export function useThemeSafe() {
  const isHydrated = useHydration();
  const { resolvedTheme, theme, setTheme } = useTheme();

  const currentTheme = useMemo(() => {
    if (!isHydrated) {
      return 'light'; // fallback до гидрации
    }

    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      return resolvedTheme;
    }

    if (theme === 'light' || theme === 'dark') {
      return theme;
    }

    return 'light';
  }, [isHydrated, resolvedTheme, theme]);

  return {
    theme: currentTheme,
    isHydrated,
    setTheme,
    rawTheme: theme,
    resolvedTheme,
  };
}
