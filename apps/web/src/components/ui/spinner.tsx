import * as React from 'react';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function Spinner({ size = 'medium' }: SpinnerProps) {
  return <div is-="spinner" data-size={size} />;
}