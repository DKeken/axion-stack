import type { Metadata, Viewport } from 'next';

import { AppProviders } from '~/components/app-providers';
import { getLocale } from '~/paraglide/runtime';
import '~/styles/app.css';

export const metadata: Metadata = {
  title: 'axion',
  description: 'axion ',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Отключаем prerendering для всех страниц
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className='size-full' lang={getLocale()}>
      <body className='w-full min-h-screen'>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
