import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'foreground0' | 'foreground1' | 'foreground2' | 'red' | 'green' | 'blue' | 'yellow';
  children: React.ReactNode;
}

export function Button({ variant = 'foreground0', children, ...props }: ButtonProps) {
  return (
    <button variant-={variant} {...props}>
      {children}
    </button>
  );
}