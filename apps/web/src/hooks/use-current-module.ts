import { useLocation } from '@tanstack/react-router';

import type { ModuleType } from '~/components/layouts/types';

export function useCurrentModule(): ModuleType {
  const location = useLocation();
  const { pathname } = location;

  if (pathname === '/') return 'home';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/proto')) return 'proto';
  if (pathname.startsWith('/flow')) return 'flow';
  if (pathname.startsWith('/telemetry')) return 'telemetry';
  if (pathname.startsWith('/billing')) return 'billing';
  if (pathname.startsWith('/docs')) return 'docs';

  return 'home';
}
