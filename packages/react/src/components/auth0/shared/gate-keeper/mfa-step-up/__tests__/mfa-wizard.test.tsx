import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { MfaWizard } from '@/components/auth0/shared/gate-keeper/mfa-step-up/mfa-wizard';
import { Dialog } from '@/components/ui/dialog';
import {
  renderWithProviders,
  mockMfaRequiredError,
  mockUseMfaRequirements,
  mockUseMfaStepUp,
} from '@/tests/utils';

const render = (ui: React.ReactElement) => renderWithProviders(<Dialog open>{ui}</Dialog>);

vi.mock('@/hooks/shared/use-mfa-requirements');
vi.mock('@/hooks/shared/use-mfa-step-up');

const mockError = mockMfaRequiredError;

const defaultProps = {
  error: mockError,
  onComplete: vi.fn(),
  onCancel: vi.fn(),
};

describe('MfaWizard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list view (default)', () => {
    it('shows title, subtitle and empty authenticators list', async () => {
      mockUseMfaRequirements();
      mockUseMfaStepUp();

      render(<MfaWizard {...defaultProps} />);

      expect(await screen.findByText('mfa.title')).toBeInTheDocument();
      expect(await screen.findByText('mfa.subtitle')).toBeInTheDocument();
      expect(await screen.findByText('mfa.no_authenticators')).toBeInTheDocument();
    });
  });

  describe('enroll view transition', () => {
    it('transitions to enrollment form when a factor is selected', async () => {
      const user = userEvent.setup();
      mockUseMfaStepUp({
        enroll: vi.fn().mockResolvedValue({ barcodeUri: 'otpauth://totp/test', secret: 'SECRET' }),
      });
      mockUseMfaRequirements({
        factors: [{ type: 'otp' as const }],
        isEnrollMode: true,
      });

      render(<MfaWizard {...defaultProps} />);

      await user.click(await screen.findByRole('button', { name: /mfa.enroll_button/i }));

      // Should leave list view
      await waitFor(() => {
        expect(screen.queryByText('mfa.subtitle')).not.toBeInTheDocument();
      });
    });

    it('returns to list view when back is clicked from enrollment form', async () => {
      const user = userEvent.setup();
      mockUseMfaStepUp({
        enroll: vi.fn().mockResolvedValue(undefined),
      });
      mockUseMfaRequirements({
        factors: [{ type: 'sms' as const }],
        isEnrollMode: true,
      });

      render(<MfaWizard {...defaultProps} />);

      await user.click(await screen.findByRole('button', { name: /mfa.enroll_button/i }));

      // Wait for enrollment form (sms shows input step)
      const backButton = await screen.findByRole('button', { name: 'mfa.back' });
      await user.click(backButton);

      // Back on list view
      expect(await screen.findByText('mfa.subtitle')).toBeInTheDocument();
    });
  });

  describe('challenge view transition', () => {
    it('transitions to verify form when an authenticator is selected', async () => {
      const user = userEvent.setup();
      mockUseMfaStepUp({
        challenge: vi.fn().mockResolvedValue({ oobCode: 'oob-123' }),
      });
      mockUseMfaRequirements({
        authenticators: [
          {
            id: 'auth-1',
            authenticatorType: 'otp',
            active: true,
            type: 'otp',
            name: 'OTP',
          } as never,
        ],
        isEnrollMode: false,
      });

      render(<MfaWizard {...defaultProps} />);

      await user.click(await screen.findByRole('button', { name: /mfa.verify_button/i }));

      // Should leave list view
      await waitFor(() => {
        expect(screen.queryByText('mfa.subtitle')).not.toBeInTheDocument();
      });
    });

    it('returns to list view when back is clicked from verify form', async () => {
      const user = userEvent.setup();
      mockUseMfaStepUp({
        challenge: vi.fn().mockResolvedValue(undefined),
      });
      mockUseMfaRequirements({
        authenticators: [
          {
            id: 'auth-1',
            authenticatorType: 'otp',
            active: true,
            type: 'otp',
            name: 'OTP',
          } as never,
        ],
        isEnrollMode: false,
      });

      render(<MfaWizard {...defaultProps} />);

      await user.click(await screen.findByRole('button', { name: /mfa.verify_button/i }));

      const backButton = await screen.findByRole('button', { name: 'mfa.back' });
      await user.click(backButton);

      expect(await screen.findByText('mfa.subtitle')).toBeInTheDocument();
    });
  });
});
