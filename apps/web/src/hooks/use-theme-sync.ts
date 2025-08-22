import { useEffect } from 'react';

import { useTheme } from 'next-themes';

export function useThemeSync() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // no-op: next-themes handles persistence in localStorage
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
