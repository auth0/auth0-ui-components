import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/theme-utils';

const toggleVariants = cva(
  "hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive theme-default:shadow-bevel-sm focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-3 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-primary bg-transparent',
        outline:
          'data-[state=on]:bg-muted data-[state=on]:text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-input-resting bg-transparent',
      },
      size: {
        default: 'h-9 min-w-9 px-2',
        sm: 'h-8 min-w-8 px-1.5',
        lg: 'h-10 min-w-10 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

function ToggleRoot({
  className,
  children,
  pressed,
  onPressedChange,
  variant = 'default',
  size = 'default',
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      data-variant={variant}
      onClick={() => onPressedChange?.(!pressed)}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

function Toggle(props: ToggleProps) {
  return <ToggleRoot {...props} />;
}

export { Toggle };
