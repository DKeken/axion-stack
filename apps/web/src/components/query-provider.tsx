'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ReactNode } from 'react';

import { useHydration } from '~/hooks/use-hydration';
import { getQueryClient } from '~/utils/query-client';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const isHydrated = useHydration();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development */}
      {process.env.NODE_ENV === 'development' && isHydrated ? (
        <ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} position='bottom' />
      ) : null}
    </QueryClientProvider>
  );
}
