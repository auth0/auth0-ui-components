/**
 * Search component.
 * @module search
 * @internal
 */

'use client';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { SearchIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const searchVariants = cva(
  'bg-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive theme-default:active:scale-[0.99] relative box-border inline-flex w-full shrink-0 cursor-text items-center justify-center gap-2 overflow-hidden rounded-2xl text-sm transition-[color,box-shadow] duration-150 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-border/50 text-input-foreground shadow-input-resting hover:shadow-input-hover hover:border-primary/25 focus-within:border-border focus-within:ring-ring focus-within:ring-4',
        error:
          'bg-destructive/25 border-destructive-border/50 text-destructive-foreground shadow-input-destructive-resting hover:shadow-input-destructive-hover hover:border-destructive-border/25 focus-within:ring-destructive-border/15 focus-within:ring-4',
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

export interface SearchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange' | 'defaultValue'
> {
  error?: boolean;
  size?: VariantProps<typeof searchVariants>['size'];
  variant?: VariantProps<typeof searchVariants>['variant'];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

function Search({
  className,
  variant,
  size,
  error,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  onClear,
  placeholder = 'Search...',
  disabled,
  ...props
}: SearchProps) {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        searchVariants({ variant: error ? 'error' : variant, size }),
        'group items-center gap-0.5 pr-1 pl-3',
        disabled && 'bg-input-muted text-input-foreground cursor-not-allowed opacity-50',
        className,
      )}
    >
      <SearchIcon className="text-muted-foreground size-4 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        className={cn(
          'placeholder:text-muted-foreground w-full flex-1 bg-transparent px-2 py-2 outline-none',
          disabled && 'cursor-not-allowed',
        )}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-invalid={error || undefined}
        {...props}
      />
      {currentValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex size-7 shrink-0 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2"
          aria-label="Clear search"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

export { Search, searchVariants };
