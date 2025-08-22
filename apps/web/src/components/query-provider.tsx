import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ReactNode } from 'react';

import { useHydration } from '~/hooks/use-hydration';
import { queryClient } from '~/utils/query-client';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const isHydrated = useHydration();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development */}
      {import.meta.env.DEV && isHydrated ? (
        <ReactQueryDevtools initialIsOpen={false} position='bottom' buttonPosition='bottom-left' />
      ) : null}
    </QueryClientProvider>
  );
}
