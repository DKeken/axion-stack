'use client';

import { useState } from 'react';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '~/components/ui/button';
import { useAuthStore } from '~/stores/auth-store';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    setIsLoading(true);

    logout()
      .then(() => {
        router.push('/auth/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Button
      className={className}
      disabled={isLoading}
      size={size}
      variant={variant}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className='h-4 w-4' />}
      {isLoading ? 'Выход...' : 'Выйти'}
    </Button>
  );
}
