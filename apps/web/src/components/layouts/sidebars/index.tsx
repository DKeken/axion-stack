import type { ModuleType } from '../types';
import type { ReactNode } from 'react';

export function getSidebarContent(module: ModuleType): ReactNode {
  switch (module) {
    default:
      return null;
  }
}
