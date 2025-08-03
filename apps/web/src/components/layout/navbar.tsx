'use client';

import React from 'react';

import { Link } from '@tanstack/react-router';

import { UserNavigation } from '~/components/auth/user-menu';

export function Navbar() {
  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <div className='flex items-center space-x-6'>
          <Link to='/' className='flex items-center space-x-2'>
            <span className='text-xl font-bold'>App</span>
          </Link>

          <div className='hidden md:flex items-center space-x-6'>
            <Link
              to='/'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
              activeProps={{
                className: 'text-foreground',
              }}
            >
              Главная
            </Link>
            <Link
              to='/profile'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
              activeProps={{
                className: 'text-foreground',
              }}
            >
              Профиль
            </Link>
          </div>
        </div>

        <UserNavigation />
      </div>
    </nav>
  );
}
