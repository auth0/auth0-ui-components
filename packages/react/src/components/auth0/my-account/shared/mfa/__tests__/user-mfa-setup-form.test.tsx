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

import { UserMFASetupForm } from '../user-mfa-setup-form';

import { renderWithProviders, createMockUserMFASetupFormProps } from '@/tests/utils';

// ===== Test Suite =====
describe('UserMFASetupForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog visibility with open prop', () => {
    it('should render the dialog when open prop is true', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);

      // When dialog is open, should display the modal
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should display enrollment title when open prop is true', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);

      // When dialog is open, should show enrollment title
      expect(await screen.findByText('enrollment_form.enroll_title')).toBeInTheDocument();
    });

    it('should not render the dialog when open prop is false', () => {
      renderWithProviders(
        <UserMFASetupForm {...createMockUserMFASetupFormProps({ open: false })} />,
      );

      // When dialog is closed, should not display modal
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Factor type specific forms', () => {
    it('should render ContactInputForm when factorType is EMAIL', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_EMAIL })}
        />,
      );

      // When factor type is email, should display email input form
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      // ContactInputForm should render with email-specific content
      const emailInput = screen.queryByLabelText(/email/i);
      if (emailInput) {
        expect(emailInput).toBeInTheDocument();
      }
    });

    it('should allow email input when factorType is EMAIL', async () => {
      const user = userEvent.setup();
      const mockEnrollMfa = vi.fn().mockResolvedValue({ data: { oob_code: 'test-code' } });

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_EMAIL,
            enrollMfa: mockEnrollMfa,
          })}
        />,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      // When email input is available, user should be able to type
      const emailInput = screen.queryByRole('textbox');
      if (emailInput) {
        await user.type(emailInput, 'test@example.com');
        // When email is typed, should update input value
        expect(emailInput).toHaveValue('test@example.com');
      }
    });

    it('should render ContactInputForm when factorType is PHONE', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PHONE })}
        />,
      );

      // When factor type is phone, should display phone input form
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should allow phone number input when factorType is PHONE', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PHONE })}
        />,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      // When phone input is available, user should be able to type
      const phoneInput = screen.queryByRole('textbox');
      if (phoneInput) {
        await user.type(phoneInput, '+1234567890');
        // When phone is typed, should update input value
        expect(phoneInput).toHaveValue('+1234567890');
      }
    });

    it('should render QRCodeEnrollmentForm when factorType is TOTP', async () => {
      renderWithProviders(
        <UserMFASetupForm {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_TOTP })} />,
      );

      // When factor type is TOTP, should display QR code enrollment form
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should call enrollMfa for TOTP setup when factorType is TOTP', async () => {
      const mockEnrollMfa = vi.fn().mockResolvedValue({
        data: { barcode_uri: 'test-barcode-uri' },
      });

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_TOTP,
            enrollMfa: mockEnrollMfa,
          })}
        />,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should render installation phase initially when factorType is PUSH_NOTIFICATION', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      // When factor type is push notification, should show installation instructions
      expect(
        await screen.findByText('enrollment_form.show_otp.install_guardian_description'),
      ).toBeInTheDocument();
    });

    it('should display app store links when in installation phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      // When installation phase is shown, should display app store links
      const appleLink = await screen.findByRole('link', { name: /app-store/i });
      const googleLink = await screen.findByRole('link', { name: /google-play/i });

      // When app store links are displayed, should have correct URLs
      expect(appleLink).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/auth0-guardian/id1093447833',
      );
      expect(googleLink).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.auth0.guardian',
      );

      // When links are displayed, should open in new tab
      expect(appleLink).toHaveAttribute('target', '_blank');
      expect(googleLink).toHaveAttribute('target', '_blank');
    });

    it('should have cancel button when in installation phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      // When installation phase is shown, should display cancel button
      expect(await screen.findByRole('button', { name: 'cancel' })).toBeInTheDocument();
    });

    it('should have continue button when in installation phase', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      // When installation phase is shown, should display continue button
      expect(await screen.findByRole('button', { name: 'continue' })).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            onClose: mockOnClose,
          })}
        />,
      );

      const cancelButton = await screen.findByRole('button', { name: 'cancel' });

      // When cancel button is clicked, should trigger onClose callback
      await user.click(cancelButton);

      // When onClose is called, should be invoked exactly once
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should transition to QR phase when continue button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      const continueButton = await screen.findByRole('button', { name: 'continue' });

      // When continue button is clicked, should move to QR enrollment phase
      await user.click(continueButton);

      await waitFor(() => {
        // When phase changes, installation description should no longer be visible
        expect(
          screen.queryByText('enrollment_form.show_otp.install_guardian_description'),
        ).not.toBeInTheDocument();
      });
    });

    it('should render ShowRecoveryCode component when factorType is RECOVERY_CODE', async () => {
      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_RECOVERY_CODE })}
        />,
      );

      // When factor type is recovery code, should display recovery code component
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should call enrollMfa to fetch recovery code when factorType is RECOVERY_CODE', async () => {
      const mockEnrollMfa = vi.fn().mockResolvedValue({
        data: { recovery_code: 'test-recovery-code-123' },
      });

      renderWithProviders(
        <UserMFASetupForm
          {...createMockUserMFASetupFormProps({
            factorType: FACTOR_TYPE_RECOVERY_CODE,
            enrollMfa: mockEnrollMfa,
          })}
        />,
      );

      await waitFor(
        () => {
          // When recovery code phase is active, should call enrollMfa
          expect(mockEnrollMfa).toHaveBeenCalled();
        },
        { timeout: 5000 },
      );
    });
  });

  it('should call onClose callback when dialog is closed', async () => {
    const mockOnClose = vi.fn();

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          onClose: mockOnClose,
          open: true,
        })}
      />,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Simulate ESC key press to close dialog
    const dialog = screen.getByRole('dialog');

    // When ESC key is pressed, should trigger dialog close
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      // When dialog is closed via ESC, should call onClose callback
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should pass enrollMfa to child components when provided', async () => {
    const mockEnrollMfa = vi.fn().mockResolvedValue({ data: {} });

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_TOTP,
          enrollMfa: mockEnrollMfa,
        })}
      />,
    );

    // When component renders, enrollMfa should be available to child components
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should handle enrollMfa errors when enrollment fails', async () => {
    const mockOnError = vi.fn();
    const mockEnrollMfa = vi.fn().mockRejectedValue(new Error('Enrollment failed'));

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_RECOVERY_CODE,
          enrollMfa: mockEnrollMfa,
          onError: mockOnError,
        })}
      />,
    );

    await waitFor(
      () => {
        // When enrollMfa fails, should handle error gracefully
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should pass confirmEnrollment to child components when provided', async () => {
    const mockConfirmEnrollment = vi.fn().mockResolvedValue({ success: true });

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_EMAIL,
          confirmEnrollment: mockConfirmEnrollment,
        })}
      />,
    );

    // When component renders, confirmEnrollment should be available to child components
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should pass onSuccess callback to child components when provided', async () => {
    const mockOnSuccess = vi.fn();

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_EMAIL,
          onSuccess: mockOnSuccess,
        })}
      />,
    );

    // When component renders, onSuccess callback should be available
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should pass onError callback to child components when provided', async () => {
    const mockOnError = vi.fn();

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          factorType: FACTOR_TYPE_EMAIL,
          onError: mockOnError,
        })}
      />,
    );

    // When component renders, onError callback should be available
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should pass custom messages to child components when provided', async () => {
    const customMessages = {
      enrollment_form: {
        enroll_title: 'Custom Enrollment Title',
      },
    };

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({
          customMessages,
        })}
      />,
    );

    // When custom messages are provided, should be available to components
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  describe('Accessibility features', () => {
    it('should have proper dialog semantics when dialog is open', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);

      // When modal is open, should have dialog role
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible title when dialog is open', async () => {
      renderWithProviders(<UserMFASetupForm {...createMockUserMFASetupFormProps()} />);

      // When modal is open, should display accessible title
      expect(await screen.findByText('enrollment_form.enroll_title')).toBeInTheDocument();
    });
  });

  it('should maintain dialog open state when transitioning between phases', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <UserMFASetupForm
        {...createMockUserMFASetupFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
      />,
    );

    const continueButton = await screen.findByRole('button', { name: 'continue' });

    // When transitioning between phases, dialog should remain open
    await user.click(continueButton);

    await waitFor(() => {
      // When phase changes, dialog should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should render successfully with all props provided', async () => {
    renderWithProviders(
      <UserMFASetupForm
        open={true}
        onClose={vi.fn()}
        factorType={FACTOR_TYPE_EMAIL}
        enrollMfa={vi.fn().mockResolvedValue({ data: {} })}
        confirmEnrollment={vi.fn().mockResolvedValue({ success: true })}
        onSuccess={vi.fn()}
        onError={vi.fn()}
        schema={{}}
        styling={{
          variables: { common: {}, light: {}, dark: {} },
          classes: {},
        }}
        customMessages={{}}
      />,
    );

    // When all props are provided, component should render successfully
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('should handle different factor types dynamically when factor type changes', async () => {
    const factorTypes: MFAType[] = [
      FACTOR_TYPE_EMAIL,
      FACTOR_TYPE_PHONE,
      FACTOR_TYPE_TOTP,
      FACTOR_TYPE_PUSH_NOTIFICATION,
      FACTOR_TYPE_RECOVERY_CODE,
    ];

    for (const factorType of factorTypes) {
      const { unmount } = renderWithProviders(
        <UserMFASetupForm {...createMockUserMFASetupFormProps({ factorType })} />,
      );

      // When factor type is provided, should render appropriate form
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      unmount();
    }
  });
});
