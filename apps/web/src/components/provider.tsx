import { useCallback } from 'react';

import { HeroUIProvider } from '@heroui/react';
import { useRouter } from '@tanstack/react-router';

interface RouterNavigateOptions {
  replace?: boolean;
}

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: RouterNavigateOptions;
  }
}

function useHref(to: string): string {
  return to;
}

export function Provider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const navigate = useCallback(
    (to: string, options?: RouterNavigateOptions) => {
      void router.navigate({ to, replace: options?.replace });
    },
    [router]
  );

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
    </HeroUIProvider>
  );
}
