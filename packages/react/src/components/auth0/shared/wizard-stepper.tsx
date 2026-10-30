/**
 * Wizard stepper navigation component.
 * @module wizard-stepper
 * @internal
 */

'use client';

import * as React from 'react';

import { Card } from '@/components/ui/card';
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperSeparator,
  StepperStep,
  StepperTitle,
  StepperTrigger,
  type StepperOrientation,
} from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id?: string;
  title: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep?: number;
  onStepClick?: (stepIndex: number, stepId?: string) => void;
  className?: string;
  hideNumbers?: boolean;
  /** Layout direction. The vertical layout has no card wrapper or separators. */
  orientation?: StepperOrientation;
}

/**
 * Wizard stepper navigation component.
 * @param props - Component props.
 * @param props.steps - Array of wizard steps
 * @param props.currentStep - Current active step index
 * @param props.onStepClick - Callback fired when a completed or current step is clicked
 * @param props.className - Optional CSS class name for styling
 * @param props.hideNumbers - Whether to hide numbers
 * @param props.orientation - Layout direction (horizontal by default)
 * @returns JSX element
 */
function WizardStepper({
  steps,
  currentStep = 0,
  onStepClick,
  className,
  hideNumbers = true,
  orientation = 'horizontal',
}: WizardStepperProps) {
  const isHorizontal = orientation === 'horizontal';

  const stepper = (
    <Stepper
      orientation={orientation}
      value={currentStep}
      className={cn(isHorizontal ? 'w-full gap-0' : 'gap-4', !isHorizontal && className)}
    >
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = !!onStepClick && (isCompleted || isCurrent);

        const body = (
          <>
            <StepperIndicator
              value={index}
              size="sm"
              showNumber={!hideNumbers}
              className="mt-0.5 size-[21px]"
            />
            <div className="flex-1">
              <StepperTitle
                value={index}
                className={cn(
                  'text-label text-foreground font-medium',
                  isHorizontal && 'whitespace-nowrap',
                )}
              >
                {step.title}
              </StepperTitle>
              {step.description && (
                <StepperDescription value={index} className="mt-1 text-muted-foreground">
                  {step.description}
                </StepperDescription>
              )}
            </div>
          </>
        );

        return (
          <React.Fragment key={step.id || index}>
            <StepperStep
              value={index}
              data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
              className={cn(
                'gap-2',
                isHorizontal ? 'flex-initial flex-row items-start' : 'items-start',
              )}
            >
              {isClickable ? (
                <StepperTrigger
                  value={index}
                  onClick={() => onStepClick(index, step.id)}
                  className="w-full gap-2"
                >
                  {body}
                </StepperTrigger>
              ) : (
                body
              )}
            </StepperStep>
            {isHorizontal && index < steps.length - 1 && (
              <StepperSeparator className="mx-4 min-w-0 flex-1 bg-border" />
            )}
          </React.Fragment>
        );
      })}
    </Stepper>
  );

  if (!isHorizontal) {
    return stepper;
  }

  return (
    <Card className={cn('w-full p-0', className)}>
      <nav aria-label="Progress" className="flex flex-col items-start gap-8 self-stretch p-6">
        {stepper}
      </nav>
    </Card>
  );
}

export { WizardStepper };
export type { WizardStepperProps };
