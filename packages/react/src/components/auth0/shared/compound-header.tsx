/**
 * Header building blocks for compound components.
 *
 * Same markup and classes as {@link Header}, split so `Title`, `Description` and an
 * actions region can be replaced, reordered or extended. Stacks on narrow screens.
 *
 * @module compound-header
 * @internal
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CompoundHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the banner, usually the title text. */
  label?: string;
}

export const CompoundHeader = React.forwardRef<HTMLDivElement, CompoundHeaderProps>(
  function CompoundHeader({ label, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="banner"
        aria-label={label ? `${label} header` : 'Header'}
        className={cn(
          'w-full mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export interface CompoundHeaderContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text alignment of the title and description. */
  align?: 'start' | 'center' | 'end';
}

const ALIGN_CLASSES = {
  start: 'text-left items-start',
  center: 'text-center items-center',
  end: 'text-right items-end',
} as const;

export const CompoundHeaderContent = React.forwardRef<HTMLDivElement, CompoundHeaderContentProps>(
  function CompoundHeaderContent({ align = 'start', className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col min-w-0 flex-1', ALIGN_CLASSES[align], className)}
        {...props}
      />
    );
  },
);

export const CompoundHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CompoundHeaderTitle({ className, ...props }, ref) {
  return (
    <h1
      ref={ref}
      className={cn(
        'text-primary font-bold leading-tight break-words text-page-header mb-0',
        className,
      )}
      {...props}
    />
  );
});

export const CompoundHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CompoundHeaderDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        'text-muted-foreground leading-relaxed break-words text-page-description mt-2',
        className,
      )}
      {...props}
    />
  );
});

export interface CompoundHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Side the actions sit on from the `sm` breakpoint up. */
  align?: 'start' | 'end';
}

export const CompoundHeaderActions = React.forwardRef<HTMLDivElement, CompoundHeaderActionsProps>(
  function CompoundHeaderActions({ align = 'end', className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-start gap-2 sm:flex-shrink-0 sm:mt-1',
          align === 'start' && 'sm:order-first',
          className,
        )}
        {...props}
      />
    );
  },
);
