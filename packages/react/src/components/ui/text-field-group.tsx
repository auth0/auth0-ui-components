'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
export type TextFieldGroupSize = 'default' | 'sm' | 'lg';

export interface ChipItem {
  label: string;
  value: string;
}

export interface TextFieldGroupProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error';
  size?: TextFieldGroupSize;
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  chips?: ChipItem[];
  onChipRemove?: (value: string) => void;
  onChipAdd?: (value: string) => void;
  summarizeChips?: boolean;
  chipVariant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'info'
    | 'success'
    | 'warning'
    | 'destructive';
}

const textFieldGroupVariants = cva(
  "bg-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive theme-default:active:scale-[0.99] relative box-border inline-flex w-full shrink-0 cursor-text items-center justify-center gap-2 overflow-hidden rounded-2xl text-sm transition-[color,box-shadow] duration-150 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-border/50 text-input-foreground shadow-input-resting hover:shadow-input-hover hover:border-primary/25 focus-within:border-border focus-within:ring-ring focus-within:ring-4',
        error:
          'bg-destructive/25 border-destructive-border/50 text-destructive-foreground shadow-input-destructive-resting hover:shadow-input-destructive-hover hover:border-destructive-border/25 focus-within:ring-destructive-border/15 focus-within:ring-4',
      },
      size: {
        default: 'min-h-10',
        sm: 'min-h-9',
        lg: 'min-h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function TextFieldGroup(
  {
    className,
    variant,
    size,
    error,
    startAdornment,
    endAdornment,
    chips = [],
    onChipRemove,
    onChipAdd,
    summarizeChips = true,
    chipVariant = 'secondary',
    onKeyDown,
    onFocus,
    onBlur,
    ...props
  }: TextFieldGroupProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const isDisabled = props.disabled;
  const [focusedChipIndex, setFocusedChipIndex] = React.useState(-1);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chipRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  React.useEffect(() => {
    chipRefs.current = chipRefs.current.slice(0, chips.length);
  }, [chips.length]);

  const handleChipRemove = (valueToRemove: string) => {
    if (isDisabled) return;
    onChipRemove?.(valueToRemove);
  };

  const handleChipKeyDown = (event: React.KeyboardEvent, chipIndex: number) => {
    if (isDisabled) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (chipIndex > 0) {
          const prevIndex = chipIndex - 1;
          setFocusedChipIndex(prevIndex);
          chipRefs.current[prevIndex]?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (chipIndex < chips.length - 1) {
          const nextIndex = chipIndex + 1;
          setFocusedChipIndex(nextIndex);
          chipRefs.current[nextIndex]?.focus();
        } else {
          setFocusedChipIndex(-1);
          inputRef.current?.focus();
        }
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        if (chips[chipIndex]) {
          handleChipRemove(chips[chipIndex].value);
        }
        if (chips.length > 1) {
          if (chipIndex === 0) {
            setFocusedChipIndex(0);
            setTimeout(() => chipRefs.current[0]?.focus(), 0);
          } else if (chipIndex >= chips.length - 1) {
            const newLastIndex = chips.length - 2;
            setFocusedChipIndex(newLastIndex);
            setTimeout(() => chipRefs.current[newLastIndex]?.focus(), 0);
          } else {
            setFocusedChipIndex(chipIndex);
            setTimeout(() => chipRefs.current[chipIndex]?.focus(), 0);
          }
        } else {
          setFocusedChipIndex(-1);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (chips[chipIndex]) {
          handleChipRemove(chips[chipIndex].value);
        }
        break;
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    const inputValue = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;

    switch (event.key) {
      case 'Enter':
        if (onChipAdd && inputValue.trim()) {
          event.preventDefault();
          onChipAdd(inputValue.trim());
        }
        break;
      case 'ArrowLeft':
        if (chips.length > 0 && cursorPosition === 0) {
          event.preventDefault();
          const lastChipIndex = chips.length - 1;
          setFocusedChipIndex(lastChipIndex);
          chipRefs.current[lastChipIndex]?.focus();
        }
        break;
      case 'Backspace':
        if (chips.length > 0 && inputValue === '') {
          event.preventDefault();
          const lastChip = chips[chips.length - 1];
          if (lastChip) {
            handleChipRemove(lastChip.value);
          }
        }
        break;
      case 'Escape':
        setFocusedChipIndex(-1);
        break;
    }

    onKeyDown?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setFocusedChipIndex(-1);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (containerRef.current && containerRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    setFocusedChipIndex(-1);
    onBlur?.(event);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current && containerRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    setFocusedChipIndex(-1);
  };

  const hasChips = chips.length > 0;
  const showAllChips = isFocused || focusedChipIndex >= 0 || !summarizeChips;
  const visibleChips = showAllChips ? chips : chips.slice(0, 1);
  const hiddenChipCount = chips.length - visibleChips.length;

  const inputHeightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-9' : 'h-8';

  const nonSummarizedContainerClassName = cn(
    textFieldGroupVariants({ variant: error ? 'error' : variant, size }),
    'group h-auto items-center gap-0.5 py-0.5',
    isDisabled && 'cursor-not-allowed opacity-50',
    isDisabled && !error && 'bg-input-muted',
    (hasChips || startAdornment) && (size === 'lg' ? 'pl-2' : 'pl-1.5'),
    endAdornment && 'pr-[5px]',
    className,
  );

  const summarizedContainerClassName = cn(
    textFieldGroupVariants({ variant: error ? 'error' : variant, size }),
    'group h-auto items-center gap-0.5 py-1',
    isDisabled && 'cursor-not-allowed opacity-50',
    isDisabled && !error && 'bg-input-muted',
    startAdornment && 'pl-[5px]',
    endAdornment && 'pr-[5px]',
    className,
  );

  if (!summarizeChips) {
    return (
      <Slot
        ref={containerRef}
        className={nonSummarizedContainerClassName}
        onClick={handleContainerClick}
        onBlur={handleContainerBlur}
      >
        <div>
          {startAdornment && (
            <div className="shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              {startAdornment}
            </div>
          )}
          <div className="scrollbar-none flex flex-1 flex-wrap items-center gap-1">
            {chips.map((chip, index) => (
              <div
                key={chip.value}
                ref={(el) => {
                  chipRefs.current[index] = el;
                }}
                tabIndex={-1}
                onKeyDown={(e) => handleChipKeyDown(e, index)}
                onFocus={() => setFocusedChipIndex(index)}
                className={cn(
                  'focus:ring-ring rounded-lg focus:ring-3 focus:outline-none',
                  focusedChipIndex === index && 'ring-ring ring-3',
                )}
              >
                <Chip
                  variant={chipVariant}
                  size="sm"
                  onDelete={isDisabled ? undefined : () => handleChipRemove(chip.value)}
                  className="max-w-xs"
                >
                  <span className="truncate">{chip.label}</span>
                </Chip>
              </div>
            ))}
            <input
              className={cn(
                'min-w-[104px] flex-1 shrink-0 bg-transparent py-2 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium',
                isDisabled && 'cursor-not-allowed opacity-50',
                !hasChips && 'px-2',
                startAdornment && 'pl-0',
                inputHeightClass,
              )}
              ref={inputRef}
              onKeyDown={handleInputKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
          </div>
          {endAdornment && (
            <div className="shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              {endAdornment}
            </div>
          )}
        </div>
      </Slot>
    );
  }

  return (
    <Slot
      ref={containerRef}
      className={summarizedContainerClassName}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
    >
      <div>
        {startAdornment && (
          <div className="shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            {startAdornment}
          </div>
        )}
        {hasChips && (showAllChips || visibleChips.length > 0) && (
          <div
            className={cn(
              'mr-0.5 flex shrink flex-wrap gap-1 py-0.5',
              size === 'lg' ? 'ml-2' : 'ml-1.5',
            )}
          >
            {visibleChips.map((chip, index) => (
              <div
                key={chip.value}
                ref={(el) => {
                  chipRefs.current[index] = el;
                }}
                tabIndex={-1}
                onKeyDown={(e) => handleChipKeyDown(e, index)}
                onFocus={() => setFocusedChipIndex(index)}
                className={cn(
                  'focus:ring-ring rounded-lg focus:ring-3 focus:outline-none',
                  focusedChipIndex === index && 'ring-ring ring-3',
                )}
              >
                <Chip
                  variant={chipVariant}
                  size="sm"
                  onDelete={isDisabled ? undefined : () => handleChipRemove(chip.value)}
                  className="max-w-xs"
                >
                  <span className="truncate">{chip.label}</span>
                </Chip>
              </div>
            ))}
            {!showAllChips && hiddenChipCount > 0 && (
              <span className="text-muted-foreground border-border flex h-4 items-center self-center border-r px-0.5 pr-1.5 text-xs">
                +{hiddenChipCount} more
              </span>
            )}
          </div>
        )}
        <input
          className={cn(
            'w-full flex-1 bg-transparent px-3 py-2 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium',
            isDisabled && 'cursor-not-allowed opacity-50',
            hasChips && 'pl-0',
            hasChips && 'min-w-[104px]',
            startAdornment && 'pl-0',
            endAdornment && 'pr-0',
            inputHeightClass,
          )}
          ref={inputRef}
          onKeyDown={handleInputKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {endAdornment && (
          <div className="shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            {endAdornment}
          </div>
        )}
      </div>
    </Slot>
  );
}

const TextFieldGroupWithRef = React.forwardRef(TextFieldGroup);

export { TextFieldGroupWithRef as TextFieldGroup, textFieldGroupVariants };
