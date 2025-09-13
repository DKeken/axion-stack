import * as React from 'react';
import { Star } from 'lucide-react';

import { cn } from '~/lib/utils';

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  readonly?: boolean;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    { className, value, max = 5, count, size = 'md', showCount = true, readonly = true, ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: 'size-3',
      md: 'size-4',
      lg: 'size-5',
    };

    const textSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
        <div className='flex items-center gap-0.5'>
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                'transition-colors',
                i < Math.floor(value)
                  ? 'fill-chart-4 text-chart-4 dark:fill-chart-4 dark:text-chart-4'
                  : 'text-muted-foreground'
              )}
            />
          ))}
        </div>
        {showCount && count !== undefined && count > 0 && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>({count})</span>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

export { Rating };
