import { ScrollShadow } from '@heroui/scroll-shadow';

import type React from 'react';

import { Logo } from '~/components/logo';

interface DesktopSidebarProps {
  children?: React.ReactNode;
}

export function DesktopSidebar({ children }: DesktopSidebarProps) {
  const hasContent = Boolean(children);

  return (
    <aside className='hidden md:flex h-full w-60 flex-col bg-background/10 backdrop-blur-xl'>
      <Logo size='md' />
      {hasContent ? (
        <ScrollShadow className='flex-1 px-3 py-3' hideScrollBar>
          {children}
        </ScrollShadow>
      ) : null}
    </aside>
  );
}
