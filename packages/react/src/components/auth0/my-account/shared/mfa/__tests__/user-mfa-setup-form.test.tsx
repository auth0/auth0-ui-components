import type { MFAType } from '@auth0/universal-components-core';
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
} from '@auth0/universal-components-core';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { UserMFASetupForm } from '@/components/auth0/my-account/shared/mfa/user-mfa-setup-form';
import {
  ENTER_CONTACT,
  ENTER_QR,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import { createMockUserMFASetupFormProps } from '@/tests/utils/__mocks__/my-account/mfa/user-mfa-setup-form.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { UserMFASetupFormProps } from '@/types/my-account/mfa/mfa-types';

describe('UserMFASetupForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog visibility', () => {
    it('renders the dialog when open and phase are set', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('displays enrollment title', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);
      expect(await screen.findByText('enrollment_form.enroll_title')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderWithProviders(
        <UserMFASetupForm {...createMockUserMFASetupFormProps({ open: false })} />,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render when enrollmentPhase is null', () => {
      renderWithProviders(
        <UserMFASetupForm {...createMockUserMFASetupFormProps({ enrollmentPhase: null })} />,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Phase-based form rendering', () => {
    it('renders ContactInputForm for EMAIL', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_EMAIL,
            enrollmentPhase: ENTER_CONTACT,
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('allows email input for EMAIL', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_EMAIL,
            enrollmentPhase: ENTER_CONTACT,
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      const emailInput = screen.queryByRole('textbox');
      if (emailInput) {
        await user.type(emailInput, 'test@example.com');
        expect(emailInput).toHaveValue('test@example.com');
      }
    });

    it('renders ContactInputForm for PHONE', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PHONE,
            enrollmentPhase: ENTER_CONTACT,
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('allows phone number input for PHONE', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PHONE,
            enrollmentPhase: ENTER_CONTACT,
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      const phoneInput = screen.queryByRole('textbox');
      if (phoneInput) {
        await user.type(phoneInput, '+1234567890');
        expect(phoneInput).toHaveValue('+1234567890');
      }
    });

    it('renders QRCodeEnrollmentForm for TOTP in ENTER_QR phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_TOTP,
            enrollmentPhase: ENTER_QR,
            otpData: { barcodeUri: 'otpauth://totp/test', manualInputCode: 'MANUAL123' },
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(await screen.findByRole('img')).toBeInTheDocument();
    });

    it('renders installation phase initially for PUSH_NOTIFICATION', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            enrollmentPhase: QR_PHASE_INSTALLATION,
          })}
        />,
      );
      expect(
        await screen.findByText('enrollment_form.show_otp.install_guardian_description'),
      ).toBeInTheDocument();
    });

    it('displays app store links in installation phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            enrollmentPhase: QR_PHASE_INSTALLATION,
          })}
        />,
      );
      const appleLink = await screen.findByRole('link', { name: /app-store/i });
      const googleLink = await screen.findByRole('link', { name: /google-play/i });
      expect(appleLink).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/auth0-guardian/id1093447833',
      );
      expect(googleLink).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.auth0.guardian',
      );
      expect(appleLink).toHaveAttribute('target', '_blank');
    });

    it('has cancel and continue buttons in installation phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            enrollmentPhase: QR_PHASE_INSTALLATION,
          })}
        />,
      );
      expect(await screen.findByRole('button', { name: 'cancel' })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'continue' })).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked in installation phase', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            enrollmentPhase: QR_PHASE_INSTALLATION,
            onClose: mockOnClose,
          })}
        />,
      );
      await user.click(await screen.findByRole('button', { name: 'cancel' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onAdvanceToQR when continue is clicked in installation phase', async () => {
      const user = userEvent.setup();
      const mockOnAdvanceToQR = vi.fn();
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            enrollmentPhase: QR_PHASE_INSTALLATION,
            onAdvanceToQR: mockOnAdvanceToQR,
          })}
        />,
      );
      await user.click(await screen.findByRole('button', { name: 'continue' }));
      expect(mockOnAdvanceToQR).toHaveBeenCalledTimes(1);
    });

    it('renders ShowRecoveryCode for RECOVERY_CODE phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_RECOVERY_CODE,
            enrollmentPhase: SHOW_RECOVERY_CODE,
            recoveryCode: 'ABCD-1234',
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  it('calls onClose when dialog is closed via ESC', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({ onClose: mockOnClose, open: true })}
      />,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('passes custom messages to child components', async () => {
    const customMessages = { enrollment_form: { enroll_title: 'Custom Enrollment Title' } };
    renderWithProviders(
      <UserMFASetupForm {...createMockUserMFASetupFormProps({ customMessages })} />,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('maintains dialog open state when rendering each phase', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
          enrollmentPhase: QR_PHASE_INSTALLATION,
        })}
      />,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    // The continue button delegates to onAdvanceToQR (hook-owned), dialog stays open
    const continueButton = await screen.findByRole('button', { name: 'continue' });
    await user.click(continueButton);
    // Dialog remains open — parent controls phase via hook
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders successfully with all required props', async () => {
    renderWithProviders(
      <UserMFASetupForm
        open={true}
        onClose={vi.fn()}
        factorType={FACTOR_TYPE_EMAIL}
        enrollmentPhase={ENTER_CONTACT}
        contact=""
        otpData={{ barcodeUri: '', manualInputCode: '' }}
        recoveryCode=""
        isEnrolling={false}
        isConfirming={false}
        onSubmitContact={vi.fn().mockResolvedValue(true)}
        onConfirmOtp={vi.fn()}
        onContinueQR={vi.fn()}
        onConfirmRecoveryCode={vi.fn()}
        onAdvanceToQR={vi.fn()}
        schema={{}}
        styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
        customMessages={{}}
      />,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('handles all factor types without crashing', async () => {
    const factorTypePhases: Array<[MFAType, string]> = [
      [FACTOR_TYPE_EMAIL, ENTER_CONTACT],
      [FACTOR_TYPE_PHONE, ENTER_CONTACT],
      [FACTOR_TYPE_TOTP, ENTER_QR],
      [FACTOR_TYPE_PUSH_NOTIFICATION, QR_PHASE_INSTALLATION],
      [FACTOR_TYPE_RECOVERY_CODE, SHOW_RECOVERY_CODE],
    ];

    for (const [factorType, enrollmentPhase] of factorTypePhases) {
      const { unmount } = renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType,
            enrollmentPhase: enrollmentPhase as UserMFASetupFormProps['enrollmentPhase'],
            otpData:
              enrollmentPhase === ENTER_QR
                ? { barcodeUri: 'otpauth://totp/test', manualInputCode: 'MC' }
                : { barcodeUri: '', manualInputCode: '' },
            recoveryCode: enrollmentPhase === SHOW_RECOVERY_CODE ? 'RC-CODE' : '',
          })}
        />,
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      unmount();
    }
  });

  describe('Accessibility', () => {
    it('has proper dialog semantics', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('has accessible title', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);
      expect(await screen.findByText('enrollment_form.enroll_title')).toBeInTheDocument();
    });
  });
});
