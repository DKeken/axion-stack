import { LoaderCircleIcon, LoaderIcon, LoaderPinwheelIcon, type LucideProps } from 'lucide-react';

import { cn } from '~/lib/utils';

type SpinnerVariantProps = Omit<SpinnerProps, 'variant'>;

const Default = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderIcon className={cn('animate-spin', className)} {...props} />
);

const Circle = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderCircleIcon className={cn('animate-spin', className)} {...props} />
);

const Pinwheel = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderPinwheelIcon className={cn('animate-spin', className)} {...props} />
);

const CircleFilled = ({ className, size = 24, ...props }: SpinnerVariantProps) => (
  <div className='relative' style={{ width: size, height: size }}>
    <div className='absolute inset-0 rotate-180'>
      <LoaderCircleIcon
        className={cn('animate-spin', className, 'text-foreground opacity-20')}
        size={size}
        {...props}
      />
    </div>
    <LoaderCircleIcon className={cn('relative animate-spin', className)} size={size} {...props} />
  </div>
);

export type SpinnerProps = LucideProps & {
  variant?: 'default' | 'circle' | 'pinwheel' | 'circle-filled';
};

export const Spinner = ({ variant, ...props }: SpinnerProps) => {
  switch (variant) {
    case 'circle':
      return <Circle {...props} />;
    case 'pinwheel':
      return <Pinwheel {...props} />;
    case 'circle-filled':
      return <CircleFilled {...props} />;
    default:
      return <Default {...props} />;
  }
};
