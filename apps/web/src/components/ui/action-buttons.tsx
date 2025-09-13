import * as React from 'react';
import { Heart, Eye } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface ActionButtonsProps {
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onView: (e: React.MouseEvent) => void;
  className?: string;
}

export function ActionButtons({
  isFavorite,
  onToggleFavorite,
  onView,
  className,
}: ActionButtonsProps) {
  return (
    <>
      {/* Always visible in bottom-right corner for all devices */}
      <div
        className={cn('absolute bottom-2 right-2 flex gap-1 z-50 pointer-events-auto', className)}
      >
        <Button
          className='h-8 w-8 p-0 bg-background/95 hover:bg-background border shadow-sm backdrop-blur-sm pointer-events-auto'
          size='sm'
          variant='outline'
          onClick={onToggleFavorite}
        >
          <Heart
            className={cn(
              'size-4 transition-colors pointer-events-none',
              isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
            )}
          />
        </Button>
        <Button
          className='h-8 w-8 p-0 bg-background/95 hover:bg-background border shadow-sm backdrop-blur-sm pointer-events-auto'
          size='sm'
          variant='outline'
          onClick={onView}
        >
          <Eye className='size-4 text-muted-foreground pointer-events-none' />
        </Button>
      </div>
    </>
  );
}
