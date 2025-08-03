import React, { useEffect, useState } from 'react';

import { useRouter } from '@tanstack/react-router';

import { Spinner } from '~/components/ui/shadcn-io/spinner';
import { useAuth } from '~/stores/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, fallback, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  // Ensure we're hydrated before showing any auth-dependent content
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle authentication timeout and redirect
  useEffect(() => {
    if (!isHydrated) return;

    if (!isLoading && !isAuthenticated) {
      // Show spinner for 3 seconds, then show "auth required" message
      const timer = setTimeout(() => {
        setShowAuthRequired(true);
        // Redirect after showing the message
        setTimeout(() => {
          void router.navigate({ to: redirectTo });
        }, 100);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowAuthRequired(false);
    }
  }, [isAuthenticated, isLoading, redirectTo, router, isHydrated]);

  // Show loading spinner until hydrated or while loading auth state
  if (!isHydrated || isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner className='h-8 w-8' />
      </div>
    );
  }

  // Show auth required message after timeout
  if (!isAuthenticated && showAuthRequired) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold'>Требуется авторизация</h2>
          <p className='text-muted-foreground'>Пожалуйста, войдите в систему</p>
        </div>
      </div>
    );
  }

  // Show spinner while waiting for timeout (user not authenticated but timeout not reached)
  if (!isAuthenticated && !showAuthRequired) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner className='h-8 w-8' />
      </div>
    );
  }

  return <>{children}</>;
}

interface PublicOnlyGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicOnlyGuard({ children, redirectTo = '/' }: PublicOnlyGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure we're hydrated before showing any auth-dependent content
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isLoading && isAuthenticated) {
      void router.navigate({ to: redirectTo });
    }
  }, [isAuthenticated, isLoading, redirectTo, router, isHydrated]);

  // Show loading spinner until hydrated or while loading auth state
  if (!isHydrated || isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner className='h-8 w-8' />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
