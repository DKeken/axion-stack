'use client';

import { useEffect } from 'react';

import { useAuthStore } from '~/stores/auth-store';

export function SessionManager() {
  const initSession = useAuthStore((s) => s.initSession);
  const refreshTokens = useAuthStore((s) => s.refreshTokens);

  useEffect(() => {
    void initSession();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshTokens();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [initSession, refreshTokens]);

  return null;
}
