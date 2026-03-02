/**
 * Wizard stepper navigation component.
 * @module wizard-stepper
 * @internal
 */

'use client';

import { Stepper, Step, StepTitle, StepDescription } from '@/components/ui/stepper';

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
}

/**
 * Wizard stepper navigation component.
 * @param props - Component props.
 * @param props.steps - Array of wizard steps
 * @param props.currentStep - Current active step index
 * @param props.onStepClick - Callback fired when a step is clicked
 * @param props.className - Optional CSS class name for styling
 * @param props.hideNumbers - Whether to hide numbers
 * @returns JSX element
 */
function WizardStepper({
  steps,
  currentStep = 0,
  onStepClick,
  className,
  hideNumbers = true,
}: WizardStepperProps) {
  return (
    <Stepper
      currentStep={currentStep}
      enableAllSteps={!!onStepClick}
      onStepClick={onStepClick}
      className={className}
    >
      {steps.map((step, index) => (
        <Step key={step.id || index} step={index} id={step.id} hideNumber={hideNumbers}>
          <StepTitle className="text-(length:--font-size-label)">{step.title}</StepTitle>
          {step.description && <StepDescription>{step.description}</StepDescription>}
        </Step>
      ))}
    </Stepper>
  );
}

export { WizardStepper };
export type { WizardStepperProps };
