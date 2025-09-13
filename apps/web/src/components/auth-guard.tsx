'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { Spinner } from './ui/spinner';

import { useAuthStore } from '~/stores/auth-store';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

function FallbackSpinner() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <Spinner />
    </div>
  );
}

export function AuthGuard({ children, fallback, redirectTo = '/auth/login' }: AuthGuardProps) {
  const router = useRouter();
  const { initializing, user } = useAuthStore(
    useShallow((s) => ({ initializing: s.initializing, user: s.user }))
  );

  useEffect(() => {
    if (!initializing && !user) {
      router.push(redirectTo);
    }
  }, [initializing, user, router, redirectTo]);

  if (initializing) {
    return fallback ?? <FallbackSpinner />;
  }

  if (!user) {
    return fallback ?? <FallbackSpinner />;
  }

  return children;
}
