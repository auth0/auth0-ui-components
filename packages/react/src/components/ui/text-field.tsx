import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/theme-utils';

const textFieldVariants = cva(
  "bg-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative box-border inline-flex w-full shrink-0 cursor-text items-center justify-center gap-2 overflow-hidden rounded-2xl text-sm transition-[color,box-shadow] duration-150 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-border/50 text-input-foreground shadow-input-resting hover:shadow-input-hover hover:border-primary/25 focus-within:border-border focus-within:ring-primary/15 focus-within:ring-4',
        error:
          'border-destructive-border/50 text-destructive-foreground shadow-input-destructive-resting hover:shadow-input-destructive-hover hover:border-destructive-border/25 focus-within:ring-destructive-border/15 focus-within:ring-4',
      },
      size: {
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  helperText?: string;
  size?: VariantProps<typeof textFieldVariants>['size'];
  variant?: VariantProps<typeof textFieldVariants>['variant'];
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { className, variant, size, error, helperText, startAdornment, endAdornment, ...props },
    ref,
  ) => {
    const isDisabled = props.disabled;

    const WrapperComponent = props.id ? 'div' : 'label';

    return (
      <div className="flex w-full flex-col">
        <WrapperComponent
          className={cn(
            textFieldVariants({ variant: error ? 'error' : variant, size }),
            'group items-center gap-0.5',
            isDisabled &&
              'bg-input-muted text-input-muted-foreground cursor-not-allowed opacity-50',
            isDisabled && variant === 'default' && 'bg-input-muted',
            startAdornment && 'pl-[5px]',
            endAdornment && 'pr-[5px]',
            className,
          )}
        >
          {startAdornment && (
            <div className="[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              {startAdornment}
            </div>
          )}
          <input
            className={cn(
              'w-full flex-1 bg-transparent px-3 py-2 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium',
              isDisabled &&
                'bg-input-muted text-input-muted-foreground cursor-not-allowed opacity-50',
              startAdornment && 'pl-0',
              endAdornment && 'pr-0',
              size === 'default' && 'h-10',
              size === 'sm' && 'h-9',
              size === 'lg' && 'h-11',
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div className="[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              {endAdornment}
            </div>
          )}
        </WrapperComponent>
        {helperText && (
          <p
            className={cn(
              'mt-1.5 px-2 text-xs',
              error ? 'text-destructive-foreground' : 'text-muted-foreground',
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export { TextField, textFieldVariants };
