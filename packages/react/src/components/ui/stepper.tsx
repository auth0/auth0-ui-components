/**
 * Multi-step progress stepper component (UDS parity, horizontal and vertical).
 * @module stepper
 * @internal
 */

'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type StepperOrientation = 'horizontal' | 'vertical';
type StepperStatus = 'complete' | 'current' | 'incomplete';

interface StepperContextValue {
  orientation: StepperOrientation;
  value?: number;
  onValueChange?: (value: number) => void;
}

const StepperContext = React.createContext<StepperContextValue>({ orientation: 'horizontal' });

const useStepperContext = () => React.useContext(StepperContext);

const getStepStatus = (stepValue: number, currentValue?: number): StepperStatus => {
  if (currentValue === undefined) return 'incomplete';
  if (stepValue < currentValue) return 'complete';
  if (stepValue === currentValue) return 'current';
  return 'incomplete';
};

const stepperVariants = cva('relative flex gap-2', {
  variants: {
    orientation: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface StepperProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'>,
    VariantProps<typeof stepperVariants> {
  value?: number;
  onValueChange?: (value: number) => void;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, orientation = 'horizontal', value, onValueChange, children, ...props }, ref) => {
    const resolvedOrientation: StepperOrientation = orientation ?? 'horizontal';
    const contextValue = React.useMemo(
      () => ({ orientation: resolvedOrientation, value, onValueChange }),
      [resolvedOrientation, value, onValueChange],
    );

    return (
      <StepperContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="stepper"
          data-orientation={resolvedOrientation}
          className={cn(stepperVariants({ orientation: resolvedOrientation }), className)}
          {...props}
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = 'Stepper';

const stepperStepVariants = cva('flex gap-3', {
  variants: {
    orientation: {
      horizontal: 'flex-1 flex-col items-center',
      vertical: 'w-full flex-row items-start',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface StepperStepProps extends React.ComponentPropsWithoutRef<'div'> {
  value: number;
}

const StepperStep = React.forwardRef<HTMLDivElement, StepperStepProps>(
  ({ className, value: stepValue, children, ...props }, ref) => {
    const { orientation, value: currentValue } = useStepperContext();
    const status = getStepStatus(stepValue, currentValue);

    return (
      <div
        ref={ref}
        data-slot="stepper-step"
        data-status={status}
        data-step={stepValue}
        className={cn(stepperStepVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepperStep.displayName = 'StepperStep';

/**
 * Status styles: complete = filled with check, current = hollow ring,
 * incomplete = muted dot (no number unless children are given).
 */
const stepperIndicatorVariants = cva(
  'flex items-center justify-center rounded-full font-medium tabular-nums transition-colors duration-200',
  {
    variants: {
      status: {
        complete: 'bg-foreground text-background dark:bg-background dark:text-foreground border-0',
        current: 'border-2 border-primary bg-background text-primary',
        incomplete: 'bg-muted-foreground/30 text-muted-foreground border-0',
      },
      size: {
        sm: 'size-5 text-xs',
        default: 'size-7 text-sm',
        lg: 'size-8 text-base',
      },
    },
    defaultVariants: {
      status: 'incomplete',
      size: 'default',
    },
  },
);

interface StepperIndicatorProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof stepperIndicatorVariants> {
  value: number;
  /** Render the step number when the step is not complete. */
  showNumber?: boolean;
}

const StepperIndicator = React.forwardRef<HTMLDivElement, StepperIndicatorProps>(
  (
    {
      className,
      value: stepValue,
      status,
      size = 'default',
      showNumber = true,
      children,
      ...props
    },
    ref,
  ) => {
    const { value: currentValue } = useStepperContext();
    const computedStatus = status ?? getStepStatus(stepValue, currentValue);

    let content: React.ReactNode = children;
    if (content === undefined) {
      if (computedStatus === 'complete') {
        content = <Check className="size-3" aria-hidden="true" />;
      } else if (showNumber) {
        content = <span>{stepValue + 1}</span>;
      }
    }

    return (
      <div
        ref={ref}
        data-slot="stepper-indicator"
        data-status={computedStatus}
        className={cn(
          stepperIndicatorVariants({ status: computedStatus, size }),
          'shrink-0',
          className,
        )}
        {...props}
      >
        {content}
      </div>
    );
  },
);
StepperIndicator.displayName = 'StepperIndicator';

const stepperSeparatorVariants = cva('shrink-0 transition-colors duration-200', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full min-w-8 self-center',
      vertical: 'h-full min-h-8 w-px',
    },
    status: {
      complete: 'bg-primary',
      incomplete: 'bg-muted-foreground/30',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    status: 'incomplete',
  },
});

interface StepperSeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
  status?: 'complete' | 'incomplete';
  /** Decorative separators are hidden from assistive tech (matches `ui/separator`). */
  decorative?: boolean;
}

const StepperSeparator = React.forwardRef<HTMLDivElement, StepperSeparatorProps>(
  ({ className, status = 'incomplete', decorative = true, ...props }, ref) => {
    const { orientation } = useStepperContext();

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        data-slot="stepper-separator"
        className={cn(stepperSeparatorVariants({ orientation, status }), className)}
        {...props}
      />
    );
  },
);
StepperSeparator.displayName = 'StepperSeparator';

interface StepperTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  value: number;
}

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, value: stepValue, children, onClick, ...props }, ref) => {
    const { value: currentValue, onValueChange } = useStepperContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onValueChange?.(stepValue);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="stepper-trigger"
        aria-current={currentValue === stepValue ? 'step' : undefined}
        className={cn(
          'flex cursor-pointer items-start gap-2 border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);
StepperTrigger.displayName = 'StepperTrigger';

interface StepperContentProps extends React.ComponentPropsWithoutRef<'div'> {
  value?: number;
}

const StepperContent = React.forwardRef<HTMLDivElement, StepperContentProps>(
  // `value` is accepted for UDS API parity; the content wrapper does not depend on it.
  ({ className, value: _value, children, ...props }, ref) => {
    const { orientation } = useStepperContext();

    return (
      <div
        ref={ref}
        data-slot="stepper-content"
        className={cn(
          'flex flex-col',
          orientation === 'horizontal' ? 'text-left' : 'flex-1',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepperContent.displayName = 'StepperContent';

interface StepperTextProps extends React.ComponentPropsWithoutRef<'div'> {
  value: number;
}

const StepperTitle = React.forwardRef<HTMLDivElement, StepperTextProps>(
  ({ className, value: stepValue, children, ...props }, ref) => {
    const { value: currentValue } = useStepperContext();
    const status = getStepStatus(stepValue, currentValue);

    return (
      <div
        ref={ref}
        data-slot="stepper-title"
        data-status={status}
        className={cn(
          'm-0 text-left text-sm font-semibold transition-colors',
          status === 'current' && 'text-primary',
          status === 'complete' && 'text-foreground',
          status === 'incomplete' && 'text-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepperTitle.displayName = 'StepperTitle';

const StepperDescription = React.forwardRef<HTMLDivElement, StepperTextProps>(
  ({ className, value: stepValue, children, ...props }, ref) => {
    const { value: currentValue } = useStepperContext();
    const status = getStepStatus(stepValue, currentValue);

    return (
      <div
        ref={ref}
        data-slot="stepper-description"
        data-status={status}
        className={cn(
          'text-xs transition-colors',
          status === 'current' && 'text-primary/70',
          status === 'complete' && 'text-muted-foreground',
          status === 'incomplete' && 'text-muted-foreground/70',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepperDescription.displayName = 'StepperDescription';

export {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperSeparator,
  StepperStep,
  StepperTitle,
  StepperTrigger,
};
export type { StepperOrientation, StepperStatus };
