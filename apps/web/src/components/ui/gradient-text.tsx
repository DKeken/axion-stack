'use client';

import * as React from 'react';

import { motion, type Transition } from 'framer-motion';

import { cn } from '~/lib/utils';

type GradientTextProps = React.ComponentProps<'span'> & {
  text: string;
  gradient?: string;
  animated?: boolean;
  transition?: Transition;
};

function GradientText({
  text,
  className,
  gradient = 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary-foreground)) 20%, hsl(var(--accent)) 50%, hsl(var(--primary-foreground)) 80%, hsl(var(--primary)) 100%)',
  animated = true,
  transition = { duration: 8, repeat: Infinity, ease: 'linear' },
  ...props
}: GradientTextProps) {
  const baseStyle: React.CSSProperties = {
    backgroundImage: gradient,
  };

  if (!animated) {
    return (
      <span
        className={cn(
          'inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-primary',
          className
        )}
        {...props}
      >
        {text}
      </span>
    );
  }

  return (
    <span className={cn('relative inline-block', className)} {...props}>
      <motion.span
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        className='text-transparent bg-clip-text bg-[length:200%_100%] font-bold'
        style={baseStyle}
        transition={transition}
      >
        {text}
      </motion.span>
      {/* Fallback для браузеров без поддержки bg-clip-text */}
      <span
        aria-hidden='true'
        className='absolute inset-0 text-primary opacity-0 [-webkit-text-fill-color:unset] [background-clip:unset] [-webkit-background-clip:unset]'
      >
        {text}
      </span>
    </span>
  );
}

export { GradientText, type GradientTextProps };
