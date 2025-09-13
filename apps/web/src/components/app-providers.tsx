'use client';

import { QueryProvider } from './query-provider';
import { SessionManager } from './session-manager';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';

import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper - step by step restoration
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      enableSystem
      attribute='class'
      defaultTheme='light'
      disableTransitionOnChange={false}
      storageKey='theme'
    >
      <QueryProvider>
        <SessionManager />
        {children}
        <Toaster richColors position='top-right' />
      </QueryProvider>
    </ThemeProvider>
  );
}
