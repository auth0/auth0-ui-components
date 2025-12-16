import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const spinnerVariants = cva(
  'inline-block h-8 w-8 animate-spin rounded-full border-2 border-transparent',
  {
    variants: {
      variant: {
        solid: '!border-t-current',
        dots: 'animate-[spin_5s_linear_infinite] border-6 border-dotted border-current',
        pulse: 'animate-pulse bg-current',
      },
      size: {
        sm: 'size-4',
        md: 'size-8',
        lg: 'size-12',
      },
      colorScheme: {
        primary: 'text-primary',
        foreground: 'text-primary-foreground',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      colorScheme: 'primary',
    },
  },
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ variant, size, colorScheme, className, ...props }: SpinnerProps) {
  return (
    <div className={cn(spinnerVariants({ variant, size, colorScheme }), className)} {...props}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
