/// <reference types="vite/client" />
import * as React from 'react';

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { AuthProvider } from '~/components/auth/auth-provider';
import { DefaultCatchBoundary } from '~/components/default-catch-boundary';
import { NotFound } from '~/components/not-found';
import { QueryProvider } from '~/components/query-provider';
import { Toaster } from '~/components/ui/toaster';
import appCss from '~/styles/app.css?url';
import { seo } from '~/utils/seo';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='size-full'>
      <head>
        <HeadContent />
      </head>
      <body className='size-full'>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <TanStackRouterDevtools position='bottom-right' />
          </AuthProvider>
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  );
}
