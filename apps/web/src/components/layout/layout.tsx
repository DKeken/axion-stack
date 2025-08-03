'use client';

import React from 'react';

import { Navbar } from './navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <main className='flex-1'>{children}</main>
    </div>
  );
}
