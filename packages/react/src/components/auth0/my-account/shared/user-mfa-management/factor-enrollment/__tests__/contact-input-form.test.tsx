import { FACTOR_TYPE_EMAIL, FACTOR_TYPE_PHONE } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { ContactInputForm } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/contact-input-form';
import { renderWithProviders, createMockContactInputFormProps } from '@/tests/utils';

describe('ContactInputForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders email input for email factor type', () => {
      renderWithProviders(
        <ContactInputForm
          {...createMockContactInputFormProps({ factorType: FACTOR_TYPE_EMAIL })}
        />,
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders phone input for phone factor type', () => {
      renderWithProviders(
        <ContactInputForm
          {...createMockContactInputFormProps({ factorType: FACTOR_TYPE_PHONE })}
        />,
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders cancel and submit buttons', () => {
      renderWithProviders(<ContactInputForm {...createMockContactInputFormProps()} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('shows spinner when enrolling', () => {
      renderWithProviders(
        <ContactInputForm {...createMockContactInputFormProps({ isEnrolling: true })} />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders OTP form when phase is enterOtp', () => {
      renderWithProviders(
        <ContactInputForm {...createMockContactInputFormProps({ phase: 'enterOtp' })} />,
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('interactions', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(<ContactInputForm {...createMockContactInputFormProps({ onClose })} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onPhaseChange with enterOtp on successful submit', async () => {
      const user = userEvent.setup();
      const onPhaseChange = vi.fn();
      const onSubmitContact = vi.fn().mockResolvedValue(true);

      renderWithProviders(
        <ContactInputForm
          {...createMockContactInputFormProps({
            factorType: FACTOR_TYPE_EMAIL,
            onPhaseChange,
            onSubmitContact,
          })}
        />,
      );

      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(onPhaseChange).toHaveBeenCalledWith('enterOtp');
      });
    });

    it('does not advance phase when onSubmitContact returns false', async () => {
      const user = userEvent.setup();
      const onPhaseChange = vi.fn();
      const onSubmitContact = vi.fn().mockResolvedValue(false);

      renderWithProviders(
        <ContactInputForm
          {...createMockContactInputFormProps({
            factorType: FACTOR_TYPE_EMAIL,
            onPhaseChange,
            onSubmitContact,
          })}
        />,
      );

      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(onSubmitContact).toHaveBeenCalled();
      });
      expect(onPhaseChange).not.toHaveBeenCalledWith('enterOtp');
    });
  });

  describe('accessibility', () => {
    it('has accessible form inputs', () => {
      renderWithProviders(<ContactInputForm {...createMockContactInputFormProps()} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('submit button is disabled when form is invalid', () => {
      renderWithProviders(<ContactInputForm {...createMockContactInputFormProps()} />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    });
  });
});
