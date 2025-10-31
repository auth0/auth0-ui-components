'use client';

import { Stepper, Step, StepTitle, StepDescription } from './stepper';

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

function WizardStepper({
  steps,
  currentStep = 0,
  onStepClick,
  className,
  hideNumbers = true,
}: WizardStepperProps) {
  return (
    <Stepper currentStep={currentStep} enableAllSteps={!!onStepClick} className={className}>
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
