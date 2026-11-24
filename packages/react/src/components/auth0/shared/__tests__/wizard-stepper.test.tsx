import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WizardStepper } from '@/components/auth0/shared/wizard-stepper';

const steps = [
  { id: 'one', title: 'Step one', description: 'First' },
  { id: 'two', title: 'Step two' },
  { id: 'three', title: 'Step three' },
];

const states = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="stepper-step"]')).map((el) =>
    el.getAttribute('data-state'),
  );

describe('WizardStepper', () => {
  it('marks steps as completed, current and pending', () => {
    const { container } = render(<WizardStepper steps={steps} currentStep={1} />);

    expect(states(container)).toEqual(['completed', 'current', 'pending']);
  });

  it('renders titles and the optional description', () => {
    render(<WizardStepper steps={steps} currentStep={0} />);

    expect(screen.getByText('Step one')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Step three')).toBeInTheDocument();
  });

  it('hides step numbers by default and shows them when requested', () => {
    const { container, rerender } = render(<WizardStepper steps={steps} currentStep={0} />);
    expect(container.querySelector('[data-slot="stepper-indicator"] span')).toBeNull();

    rerender(<WizardStepper steps={steps} currentStep={0} hideNumbers={false} />);
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');
    expect(indicators[1]?.textContent).toBe('2');
  });

  it('renders a check for completed steps and no number for pending steps', () => {
    const { container } = render(
      <WizardStepper steps={steps} currentStep={2} hideNumbers={false} />,
    );
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');

    expect(indicators[0]?.querySelector('svg')).toBeInTheDocument();
    expect(indicators[2]?.getAttribute('data-status')).toBe('current');
  });

  describe('navigation', () => {
    it('is not clickable without onStepClick', () => {
      render(<WizardStepper steps={steps} currentStep={1} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('lets completed and current steps be clicked, not pending ones', () => {
      const onStepClick = vi.fn();
      render(<WizardStepper steps={steps} currentStep={1} onStepClick={onStepClick} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      fireEvent.click(buttons[0]!);
      expect(onStepClick).toHaveBeenCalledWith(0, 'one');
    });

    it('marks the current step with aria-current', () => {
      render(<WizardStepper steps={steps} currentStep={1} onStepClick={vi.fn()} />);

      expect(screen.getByRole('button', { name: /step two/i })).toHaveAttribute(
        'aria-current',
        'step',
      );
    });
  });

  describe('orientation', () => {
    it('renders horizontally in a labelled card with separators by default', () => {
      const { container } = render(<WizardStepper steps={steps} currentStep={0} />);

      expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
      expect(container.querySelector('[data-slot="stepper"]')).toHaveAttribute(
        'data-orientation',
        'horizontal',
      );
      expect(container.querySelectorAll('[data-slot="stepper-separator"]')).toHaveLength(2);
    });

    it('renders vertically without a card wrapper or separators', () => {
      const { container } = render(
        <WizardStepper steps={steps} currentStep={0} orientation="vertical" />,
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(container.querySelector('[data-slot="stepper"]')).toHaveAttribute(
        'data-orientation',
        'vertical',
      );
      expect(container.querySelectorAll('[data-slot="stepper-separator"]')).toHaveLength(0);
    });

    it('applies className to the outer element in both orientations', () => {
      const { container, rerender } = render(<WizardStepper steps={steps} className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');

      rerender(<WizardStepper steps={steps} className="custom" orientation="vertical" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
