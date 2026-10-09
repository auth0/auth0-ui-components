/**
 * Avatar components for displaying user profile pictures or fallback initials.
 * @module avatar
 * @internal
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  return (
    <img
      data-slot="avatar-image"
      alt={props.alt}
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, style, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full text-primary-foreground font-semibold',
        className,
      )}
      style={{
        background:
          'linear-gradient(195deg, oklch(from var(--color-neutral-max) l c h) -15%, oklch(from var(--color-neutral-12) l c h) 65%, oklch(from var(--color-primary) l c h) 95%, oklch(from var(--color-primary) l c h) 120%)',
        ...style,
      }}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
