import { AsyncLocalStorage } from 'node:async_hooks';

import { createMiddleware } from '@tanstack/react-start';

import { resolveLocale } from './resolve-locale';

import { baseLocale, type Locale, overwriteGetLocale } from '~/paraglide/runtime.js';

export const localeMiddleware = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    const standardLocale = await resolveLocale();
    return next({
      sendContext: {
        locale: standardLocale,
      },
    });
  })
  .server(({ context: { locale }, next }) => {
    const storage = new AsyncLocalStorage<Locale>();
    overwriteGetLocale(() => storage.getStore() ?? baseLocale);

    return storage.run(locale, next);
  });
