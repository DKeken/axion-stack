import React, { useEffect, type ReactNode } from 'react';

import { useAuthStore } from '~/stores/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state on app start
    void initialize();
  }, [initialize]);

  return <>{children}</>;
}
