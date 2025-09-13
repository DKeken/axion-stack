'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion, type Transition } from 'framer-motion';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  "relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-8 has-[>svg]:px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const rippleVariants = cva('absolute rounded-full size-5 pointer-events-none', {
  variants: {
    variant: {
      default: 'bg-primary-foreground/30',
      destructive: 'bg-destructive-foreground/30',
      outline: 'bg-foreground/20',
      secondary: 'bg-secondary-foreground/30',
      ghost: 'bg-accent-foreground/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface Ripple {
  id: number;
  x: number;
  y: number;
}

type RippleButtonProps = HTMLMotionProps<'button'> & {
  children: React.ReactNode;
  rippleClassName?: string;
  scale?: number;
  transition?: Transition;
  asChild?: boolean;
} & VariantProps<typeof buttonVariants>;

function RippleButton({
  ref,
  children,
  onClick,
  className,
  rippleClassName,
  variant,
  size,
  scale = 10,
  transition = { duration: 0.6, ease: 'easeOut' },
  asChild = false,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  // Handle ref forwarding safely
  React.useEffect(() => {
    if (typeof ref === 'function') {
      ref(buttonRef.current);
    } else if (ref && 'current' in ref) {
      ref.current = buttonRef.current;
    }
  });

  const createRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      if (onClick) {
        onClick(event);
      }
    },
    [createRipple, onClick]
  );

  if (asChild) {
    // Filter out motion-specific props for Slot
    const {
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileFocus: _whileFocus,
      whileInView: _whileInView,
      animate: _animate,
      initial: _initial,
      exit: _exit,
      variants: _variants,
      style: _style,
      layoutId: _layoutId,
      layout: _layout,
      onAnimationStart: _onAnimationStart,
      onAnimationComplete: _onAnimationComplete,
      ...slotProps
    } = props;
    // Ignore layoutDependency to avoid 'any' type issue

    return (
      <Slot
        ref={buttonRef}
        className={cn(buttonVariants({ variant, size, className }))}
        data-slot='ripple-button'
        {...slotProps}
        onClick={handleClick}
      >
        {children}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            animate={{ scale, opacity: 0 }}
            className={cn(rippleVariants({ variant, className: rippleClassName }))}
            initial={{ scale: 0, opacity: 0.5 }}
            style={{
              top: ripple.y - 10,
              left: ripple.x - 10,
            }}
            transition={transition}
          />
        ))}
      </Slot>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot='ripple-button'
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      {...props}
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          animate={{ scale, opacity: 0 }}
          className={cn(rippleVariants({ variant, className: rippleClassName }))}
          initial={{ scale: 0, opacity: 0.5 }}
          style={{
            top: ripple.y - 10,
            left: ripple.x - 10,
          }}
          transition={transition}
        />
      ))}
    </motion.button>
  );
}

export { RippleButton, type RippleButtonProps };
