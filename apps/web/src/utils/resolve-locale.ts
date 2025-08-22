import { createIsomorphicFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { baseLocale, getLocale, type Locale } from '~/paraglide/runtime.js';
import { paraglideMiddleware } from '~/paraglide/server.js';

export const resolveLocale = createIsomorphicFn()
  .client(getLocale)
  .server(() => {
    const request = getWebRequest();

    if (!request) {
      return baseLocale;
    }

    return new Promise<Locale>((resolve) => {
      void paraglideMiddleware(request, ({ locale }) => {
        resolve(locale);
      });
    });
  });
