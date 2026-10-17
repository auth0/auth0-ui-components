/**
 * Alert component with status variants.
 * @module alert
 * @internal
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'shadow-bevel-xs bg-input theme-default:outline relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 overflow-clip rounded-3xl p-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'text-foreground theme-default:outline-transparent border-b-2 border-transparent',
        info: 'text-info-foreground [&>svg]:text-info-foreground theme-default:outline-info-foreground/15',
        success:
          'text-success-foreground [&>svg]:text-success-foreground theme-default:outline-success-foreground/15',
        warning:
          'text-warning-foreground [&>svg]:text-warning-foreground theme-default:outline-warning-foreground/15',
        destructive:
          'text-destructive-foreground [&>svg]:text-destructive-foreground theme-default:outline-destructive-foreground/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 flex h-auto min-h-4 leading-4.5 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  );
}
function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('absolute top-2 right-2 flex items-center space-x-4', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
