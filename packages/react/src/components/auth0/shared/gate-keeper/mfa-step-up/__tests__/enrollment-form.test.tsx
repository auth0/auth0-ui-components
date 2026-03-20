import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { EnrollmentForm } from '@/components/auth0/shared/gate-keeper/mfa-step-up/enrollment-form';
import { Dialog } from '@/components/ui/dialog';
import { renderWithProviders, mockMfaRequiredError, mockUseMfaStepUp } from '@/tests/utils';

const render = (ui: React.ReactElement) => renderWithProviders(<Dialog open>{ui}</Dialog>);

vi.mock('@/hooks/shared/use-mfa-step-up');

const mockError = mockMfaRequiredError;
const baseProps = { error: mockError, onComplete: vi.fn(), onCancel: vi.fn() };

describe('EnrollmentForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Push factor — install step', () => {
    it('shows install title and description', async () => {
      mockUseMfaStepUp();

      render(<EnrollmentForm {...baseProps} factor={{ type: 'push' as const }} />);

      expect(await screen.findByText('mfa.enroll.install_title')).toBeInTheDocument();
      expect(await screen.findByText('mfa.enroll.install_description')).toBeInTheDocument();
    });

    it('shows App Store and Google Play links', async () => {
      mockUseMfaStepUp();

      render(<EnrollmentForm {...baseProps} factor={{ type: 'push' as const }} />);

      const appleLink = await screen.findByRole('link', { name: /apple logo/i });
      const googleLink = await screen.findByRole('link', { name: /google logo/i });

      expect(appleLink).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/auth0-guardian/id1093447833',
      );
      expect(googleLink).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.auth0.guardian',
      );
    });

    it('calls onCancel when back is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      mockUseMfaStepUp();

      render(
        <EnrollmentForm
          {...baseProps}
          onCancel={mockOnCancel}
          factor={{ type: 'push' as const }}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('SMS / Voice factor — input step', () => {
    it('shows phone input form for SMS factor', async () => {
      mockUseMfaStepUp();

      render(<EnrollmentForm {...baseProps} factor={{ type: 'sms' as const }} />);

      expect(await screen.findByText('mfa.enroll.phone_title')).toBeInTheDocument();
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
    });

    it('calls enroll with voice factorType on submit', async () => {
      const user = userEvent.setup();
      const mockEnroll = vi.fn().mockResolvedValue({ id: 'auth-1' });
      mockUseMfaStepUp({ enroll: mockEnroll });

      render(<EnrollmentForm {...baseProps} factor={{ type: 'voice' as const }} />);

      const input = await screen.findByRole('textbox');
      await user.type(input, '+1234567890');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledWith(
          expect.objectContaining({ factorType: 'voice', phoneNumber: '+1234567890' }),
        );
      });
    });

    it('calls enroll with phone number on submit', async () => {
      const user = userEvent.setup();
      const mockEnroll = vi.fn().mockResolvedValue({ id: 'auth-1' });
      mockUseMfaStepUp({ enroll: mockEnroll });

      render(<EnrollmentForm {...baseProps} factor={{ type: 'sms' as const }} />);

      const input = await screen.findByRole('textbox');
      await user.type(input, '+1234567890');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledWith(
          expect.objectContaining({ factorType: 'sms', phoneNumber: '+1234567890' }),
        );
      });
    });

    it('calls onCancel when back is clicked on input step', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      mockUseMfaStepUp();

      render(
        <EnrollmentForm {...baseProps} onCancel={mockOnCancel} factor={{ type: 'sms' as const }} />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email factor — input step', () => {
    it('calls enroll with email on submit', async () => {
      const user = userEvent.setup();
      const mockEnroll = vi.fn().mockResolvedValue({ id: 'auth-1' });
      mockUseMfaStepUp({ enroll: mockEnroll });

      render(<EnrollmentForm {...baseProps} factor={{ type: 'email' as const }} />);

      expect(await screen.findByText('mfa.enroll.email_title')).toBeInTheDocument();

      const input = await screen.findByRole('textbox');
      await user.type(input, 'user@example.com');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledWith(
          expect.objectContaining({ factorType: 'email', email: 'user@example.com' }),
        );
      });
    });
  });

  describe('OTP factor — QR step', () => {
    it('shows QR code and continue button after enroll resolves', async () => {
      mockUseMfaStepUp({
        enroll: vi.fn().mockResolvedValue({
          barcodeUri: 'otpauth://totp/test?secret=SECRET',
          secret: 'SECRET',
          authenticatorType: 'otp',
        }),
      });

      render(<EnrollmentForm {...baseProps} factor={{ type: 'otp' as const }} />);

      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'mfa.enroll.qr_alt' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'mfa.continue' })).toBeInTheDocument();
      });
    });
  });
});
