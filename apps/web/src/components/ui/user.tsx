import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

import { cn } from '~/lib/utils';

interface UserProps {
  name?: string;
  description?: string;
  avatarProps?: {
    src?: string;
    name?: string;
    alt?: string;
    className?: string;
  };
  className?: string;
  classNames?: {
    base?: string;
    name?: string;
    description?: string;
  };
  isFocusable?: boolean;
}

function User({
  name,
  description,
  avatarProps,
  className,
  classNames,
  isFocusable = false,
  ...props
}: UserProps & React.HTMLAttributes<HTMLDivElement>) {
  const initials = avatarProps?.name
    ? avatarProps.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

  return (
    <div
      className={cn('flex items-center gap-3', classNames?.base, className)}
      {...(isFocusable && { tabIndex: 0, role: 'button' })}
      {...props}
    >
      <Avatar className={cn('size-6', avatarProps?.className)}>
        <AvatarImage alt={avatarProps?.alt || `${name || 'User'} avatar`} src={avatarProps?.src} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {(name || description) && (
        <div className='flex flex-col'>
          {name && (
            <span className={cn('text-sm font-medium leading-none', classNames?.name)}>{name}</span>
          )}
          {description && (
            <span
              className={cn(
                'text-xs text-muted-foreground leading-none mt-1',
                classNames?.description
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { User };
export type { UserProps };
