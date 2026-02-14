'use client';

import * as React from 'react';

import { FormActions } from '@/components/auth0/shared/form-actions';
import { Spinner } from '@/components/auth0/shared/spinner';
import { WizardStepper } from '@/components/auth0/shared/wizard-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StepFormActions {
  showPrevious?: boolean;
  showNext?: boolean;
  onPreviousAction?: (stepId: string) => Promise<boolean> | boolean;
  onNextAction?: (stepId: string) => Promise<boolean> | boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ComponentType<StepProps>;
  actions?: StepFormActions;
}

export interface StepProps {
  onPrevious?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
}

export interface FormActionLabels {
  nextButtonLabel?: string;
  previousButtonLabel?: string;
  completeButtonLabel?: string;
}

export interface WizardProps {
  steps: WizardStep[];
  initialStep?: number;
  onComplete?: () => Promise<void> | void;
  className?: string;
  formActionLabels?: FormActionLabels;
  hideStepperNumbers?: boolean;
  isLoading?: boolean;
  allowStepNavigation?: boolean;
}

function Wizard({
  steps,
  initialStep = 0,
  onComplete,
  className,
  formActionLabels,
  hideStepperNumbers = false,
  isLoading = false,
  allowStepNavigation = true,
}: WizardProps) {
  const [activeStep, setActiveStep] = React.useState(initialStep);

  const currentStepConfig = steps[activeStep];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = React.useCallback(async () => {
    if (isLoading) return;

    const step = steps[activeStep];

    if (step?.actions?.onNextAction) {
      const canProceed = await step.actions.onNextAction(step.id);
      if (!canProceed) {
        return;
      }
    }

    if (isLastStep) {
      await onComplete?.();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  }, [activeStep, isLastStep, steps, onComplete, isLoading]);

  const handlePrevious = React.useCallback(async () => {
    if (isFirstStep) return;

    const step = steps[activeStep];

    if (step?.actions?.onPreviousAction) {
      const canProceed = await step.actions.onPreviousAction(step.id);
      if (!canProceed) {
        return;
      }
    }

    setActiveStep((prev) => prev - 1);
  }, [activeStep, isFirstStep, steps]);

  const handleStepClick = React.useCallback(
    async (stepIndex: number) => {
      if (isLoading || !allowStepNavigation) return;

      // Only allow navigation to previous steps or the current step
      if (stepIndex > activeStep) return;

      setActiveStep(stepIndex);
    },
    [activeStep, isLoading, allowStepNavigation],
  );

  const CurrentStepComponent = currentStepConfig?.content;
  const showPrevious = currentStepConfig?.actions?.showPrevious !== false && !isFirstStep;
  const showNext = currentStepConfig?.actions?.showNext ?? true;

  const labels = {
    nextButtonLabel: 'Next',
    previousButtonLabel: 'Previous',
    completeButtonLabel: 'Submit',
    ...formActionLabels,
  };

  return (
    <div className={cn('space-y-6', className)}>
      <WizardStepper
        steps={steps}
        currentStep={activeStep}
        hideNumbers={hideStepperNumbers}
        onStepClick={allowStepNavigation ? handleStepClick : undefined}
      />

      <Card>
        <CardContent className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Spinner />
            </div>
          )}
          <div className={cn(isLoading && 'opacity-50 pointer-events-none')}>
            {CurrentStepComponent ? (
              <CurrentStepComponent
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLoading={isLoading}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <FormActions
        isLoading={isLoading}
        showPrevious={showPrevious}
        showNext={showNext}
        showUnsavedChanges={false}
        nextAction={{
          type: 'button',
          label: isLastStep ? labels.completeButtonLabel : labels.nextButtonLabel,
          variant: 'primary',
          onClick: handleNext,
        }}
        previousAction={{
          type: 'button',
          label: labels.previousButtonLabel,
          variant: 'outline',
          onClick: handlePrevious,
        }}
      />
    </div>
  );
}

export { Wizard };
