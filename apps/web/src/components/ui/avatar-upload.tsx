'use client';

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { Camera, Upload, Check, AlertCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Progress } from './progress';

import { cn } from '~/lib/utils';

// Avatar upload variants
const avatarUploadVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full transition-all',
  {
    variants: {
      size: {
        sm: 'size-16',
        md: 'size-24',
        lg: 'size-32',
        xl: 'size-40',
      },
      state: {
        idle: 'cursor-pointer hover:opacity-80',
        uploading: 'cursor-not-allowed opacity-70',
        success: 'cursor-pointer',
        error: 'cursor-pointer border-2 border-destructive',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'idle',
    },
  }
);

interface AvatarUploadProps extends VariantProps<typeof avatarUploadVariants> {
  /** Current avatar URL */
  src?: string;
  /** Fallback text/initials */
  fallback?: string;
  /** Upload progress (0-100) */
  progress?: number;
  /** Upload state */
  state?: 'idle' | 'uploading' | 'success' | 'error';
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed file types */
  accept?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** File upload handler */
  onUpload?: (file: File) => void | Promise<void>;
  /** Remove avatar handler */
  onRemove?: () => void | Promise<void>;
  /** Alt text for accessibility */
  alt?: string;
}

function AvatarUpload({
  src,
  fallback,
  progress = 0,
  state = 'idle',
  error,
  success,
  maxSize = 2 * 1024 * 1024, // 2MB
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  disabled = false,
  className,
  onUpload,
  onRemove,
  alt = 'Avatar',
  size,
  ...props
}: AvatarUploadProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Combined error state
  const currentError = error || localError;

  // File validation
  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    const acceptedTypes = accept.split(',').map((type) => type.trim());
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please select an image file.';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onUpload) return;

    const [file] = files;
    const validationError = validateFile(file);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFileSelect(event.target.files);
  };

  // Handle drag events
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && state !== 'uploading') {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    if (!disabled && state !== 'uploading') {
      void handleFileSelect(event.dataTransfer.files);
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    if (!disabled && state !== 'uploading') {
      fileInputRef.current?.click();
    }
  };

  // Clear error on state change
  React.useEffect(() => {
    if (state === 'success') {
      setLocalError(null);
    }
  }, [state]);

  return (
    <div className='relative inline-flex flex-col items-center gap-3'>
      {/* Avatar Container */}
      <div
        aria-label='Upload avatar'
        className={cn(
          avatarUploadVariants({ size, state }),
          dragOver ? 'ring-2 ring-primary ring-offset-2' : '',
          className
        )}
        role='button'
        tabIndex={disabled || state === 'uploading' ? -1 : 0}
        onClick={handleClick}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && state !== 'uploading') {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {/* Avatar */}
        <Avatar className='size-full'>
          <AvatarImage alt={alt} src={src} />
          <AvatarFallback className='text-lg font-medium'>
            {fallback || <Camera className='size-6 text-muted-foreground' />}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        {(state === 'idle' || dragOver) && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100 rounded-full'>
            <Camera className='size-6 text-primary-foreground' />
          </div>
        )}

        {/* Uploading State */}
        {state === 'uploading' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 rounded-full'>
            <Upload className='size-6 text-primary-foreground animate-pulse' />
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className='absolute -top-1 -right-1 rounded-full bg-chart-4 p-1'>
            <Check className='size-3 text-primary-foreground' />
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className='absolute -top-1 -right-1 rounded-full bg-destructive p-1'>
            <AlertCircle className='size-3 text-primary-foreground' />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {state === 'uploading' && (
        <div className='w-full max-w-[200px]'>
          <Progress className='h-2' value={progress} />
          <p className='text-xs text-muted-foreground text-center mt-1'>
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Messages */}
      {currentError && (
        <p className='text-xs text-destructive text-center max-w-[200px]' role='alert'>
          {currentError}
        </p>
      )}

      {success && state === 'success' && (
        <p className='text-xs text-chart-4 text-center max-w-[200px]' role='alert'>
          {success}
        </p>
      )}

      {/* Upload Instructions */}
      {!src && state === 'idle' && !currentError && (
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>Click to upload or drag and drop</p>
          <p className='text-xs text-muted-foreground'>
            Max {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        accept={accept}
        aria-label='Select avatar file'
        className='sr-only'
        disabled={disabled || state === 'uploading'}
        type='file'
        onChange={handleInputChange}
      />
    </div>
  );
}

// Export component and variants
export { AvatarUpload, avatarUploadVariants };
export type { AvatarUploadProps };
