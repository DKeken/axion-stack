'use client';

import React from 'react';

import { useRouter } from '@tanstack/react-router';
import { LogOut, Settings, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useToast } from '~/hooks/use-toast';
import { useAuth, useAuthOperations } from '~/stores/auth-store';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { logout, isLoading } = useAuthOperations();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();

      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из системы',
      });

      await router.navigate({ to: '/auth/login' });
    } catch (_error) {
      toast({
        title: 'Ошибка выхода',
        description: 'Произошла ошибка при выходе из системы',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return user.email.charAt(0).toUpperCase();

    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className={`relative h-10 w-10 rounded-full ${className ?? ''}`}>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
              alt={user.name ?? user.email}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.name ?? 'Пользователь'}</p>
            <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              void router.navigate({ to: '/profile' });
            }}
            className='cursor-pointer'
          >
            <User className='mr-2 h-4 w-4' />
            <span>Профиль</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              void router.navigate({ to: '/settings' });
            }}
            className='cursor-pointer'
          >
            <Settings className='mr-2 h-4 w-4' />
            <span>Настройки</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            void handleLogout();
          }}
          className='cursor-pointer text-destructive focus:text-destructive'
          disabled={isLoading}
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{isLoading ? 'Выход...' : 'Выйти'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Компонент для отображения в навигации
export function UserNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className='flex items-center space-x-2'>
        <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center space-x-2'>
        <Button
          variant='ghost'
          onClick={() => {
            void router.navigate({ to: '/auth/login' });
          }}
        >
          Войти
        </Button>
        <Button
          onClick={() => {
            void router.navigate({ to: '/auth/register' });
          }}
        >
          Регистрация
        </Button>
      </div>
    );
  }

  return <UserMenu />;
}
