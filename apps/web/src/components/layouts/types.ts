import type { ReactNode } from 'react';

export type ModuleType = 'home' | 'chat' | 'proto' | 'flow' | 'telemetry' | 'billing' | 'docs';

export interface SidebarContent {
  module: ModuleType;
  content: ReactNode;
}

export interface ModuleSidebarProps {
  className?: string;
}
