'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

import { Card } from './card';
import { Separator } from './separator';

interface StepperContextValue {
  currentStep: number;
  isClickable: boolean;
  onStepClick?: (stepNumber: number, stepId?: string) => void;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

const useStepperContext = () => {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
};

interface StepperProps {
  currentStep?: number;
  className?: string;
  onStepClick?: (stepNumber: number, stepId?: string) => void;
  enableAllSteps?: boolean;
  children: React.ReactNode;
}

function Stepper({
  currentStep = 0,
  className,
  onStepClick,
  enableAllSteps = false,
  children,
}: StepperProps) {
  const contextValue: StepperContextValue = React.useMemo(
    () => ({
      currentStep,
      isClickable: enableAllSteps && !!onStepClick,
      onStepClick,
    }),
    [currentStep, enableAllSteps, onStepClick],
  );

  const processedChildren = React.useMemo(() => {
    const childArray = React.Children.toArray(children);
    const result: React.ReactNode[] = [];

    childArray.forEach((child, index) => {
      result.push(child);
      if (index < childArray.length - 1) {
        result.push(<StepSeparator key={`separator-${index}`} />);
      }
    });

    return result;
  }, [children]);

  return (
    <StepperContext.Provider value={contextValue}>
      <Card className={cn('w-full p-0', className)} data-slot="stepper">
        <nav aria-label="Progress" className="flex p-6 flex-col items-start gap-8 self-stretch">
          <div className="flex items-center w-full">{processedChildren}</div>
        </nav>
      </Card>
    </StepperContext.Provider>
  );
}

interface StepProps {
  step: number;
  id?: string;
  hideNumber?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function Step({ step, id, hideNumber = true, className, children, onClick }: StepProps) {
  const { currentStep, isClickable, onStepClick } = useStepperContext();

  const isCurrent = step === currentStep;
  const isCompleted = step < currentStep;
  const isClickableStep = isClickable && (isCompleted || isCurrent);

  const handleClick = () => {
    if (isClickableStep) {
      onClick?.();
      onStepClick?.(step, id);
    }
  };

  return (
    <div
      data-slot="stepper-step"
      data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
      data-step={step}
      className={cn(
        'flex items-start',
        isClickableStep && 'cursor-pointer hover:opacity-80 transition-opacity',
        className,
      )}
      onClick={handleClick}
      role={isClickableStep ? 'button' : undefined}
      tabIndex={isClickableStep ? 0 : undefined}
      onKeyDown={
        isClickableStep
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-colors w-[21px] h-[21px] flex-shrink-0 mt-0.5',
          isCompleted
            ? 'bg-foreground text-background dark:bg-background dark:text-foreground border-0'
            : isCurrent
              ? 'border-2 border-primary bg-background text-primary'
              : 'bg-muted-foreground/30 border-0 text-muted-foreground',
        )}
      >
        {isCompleted ? (
          <Check className="w-3 h-3" />
        ) : !hideNumber ? (
          <span className="text-xs font-medium">{step + 1}</span>
        ) : null}
      </div>

      <div className="ml-2 flex-1">{children}</div>
    </div>
  );
}

interface StepTitleProps {
  className?: string;
  children: React.ReactNode;
}

function StepTitle({ className, children }: StepTitleProps) {
  return (
    <p
      data-slot="stepper-title"
      className={cn(
        'text-sm font-medium transition-colors whitespace-nowrap text-foreground',
        className,
      )}
    >
      {children}
    </p>
  );
}

interface StepSeparatorProps {
  className?: string;
}

function StepSeparator({ className }: StepSeparatorProps) {
  return (
    <Separator
      orientation="horizontal"
      className={cn('flex-1 mx-4', className)}
      data-slot="stepper-separator"
    />
  );
}

interface StepDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function StepDescription({ className, children }: StepDescriptionProps) {
  return (
    <p
      data-slot="stepper-description"
      className={cn('text-xs text-muted-foreground mt-1', className)}
    >
      {children}
    </p>
  );
}

export { Stepper, Step, StepTitle, StepSeparator, StepDescription };
