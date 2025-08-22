/// <reference types="vite/client" />

import { DropdownItem } from '@heroui/dropdown';
import { Link as HeroUILink } from '@heroui/link';
import { createLink, createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import type { ReactNode } from 'react';

import { DefaultCatchBoundary } from '~/components/default-catch-boundary';
import { NotFound } from '~/components/not-found';
import { Provider } from '~/components/provider';
import { QueryProvider } from '~/components/query-provider';
import { SessionManager } from '~/components/session-manager';
import { ThemeProvider } from '~/components/theme-provider';
import { useHydration } from '~/hooks/use-hydration';
import { getLocale } from '~/paraglide/runtime';
// import { getInitialTheme } from '~/lib/theme.server';
import appCss from '~/styles/app.css?url';
import { seo } from '~/utils/seo';

export const Link = createLink(HeroUILink);
export const DropdownItemLink = createLink(DropdownItem);

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
        title: 'GearAI | AI-Powered Chat Platform',
        description:
          'Продвинутая платформа для общения с AI моделями. Создавайте, управляйте и делитесь чатами.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      // Tailwind v4 CSS-first already includes HeroUI styles via @plugin; no direct CSS link needed
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
    scripts: [],
  }),

  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Provider>
        <SessionManager />
        <Outlet />
      </Provider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const forcedThemeValue = undefined;
  const isHydrated = useHydration();
  const htmlClass = 'size-full';

  return (
    <html lang={getLocale()} className={htmlClass} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='size-full'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          storageKey='theme'
          forcedTheme={forcedThemeValue}
        >
          <QueryProvider>
            {children}
            {import.meta.env.DEV && isHydrated ? (
              <TanStackRouterDevtools position='bottom-right' />
            ) : null}
          </QueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
