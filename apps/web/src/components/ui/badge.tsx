import * as React from 'react';

export interface BadgeProps {
  variant?: 'red' | 'green' | 'blue' | 'yellow' | 'foreground0' | 'foreground1' | 'foreground2';
  children: React.ReactNode;
}

export function Badge({ variant = 'foreground0', children }: BadgeProps) {
  return (
    <span is-="badge" variant-={variant}>
      {children}
    </span>
  );
}