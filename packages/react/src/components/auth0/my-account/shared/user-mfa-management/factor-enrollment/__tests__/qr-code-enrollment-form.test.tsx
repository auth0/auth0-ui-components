import { FACTOR_TYPE_TOTP, FACTOR_TYPE_PUSH_NOTIFICATION } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { QRCodeEnrollmentForm } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/qr-code-enrollment-form';
import { renderWithProviders, createMockQRCodeEnrollmentFormProps } from '@/tests/utils';

describe('QRCodeEnrollmentForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders QR code container on scan phase', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ phase: 'scan' })} />,
      );

      // QRCodeDisplayer renders an <img> or a loading container — either is present
      const qrContainer = document.querySelector('.flex.justify-center');
      expect(qrContainer).toBeInTheDocument();
    });

    it('renders OTP form on enter-otp phase', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ phase: 'enter-otp' })} />,
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders cancel and continue buttons on scan phase', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ phase: 'scan' })} />,
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('shows spinner when enrolling', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ isEnrolling: true })} />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders Guardian app store links for push notification factor', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm
          {...createMockQRCodeEnrollmentFormProps({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION })}
        />,
      );

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('does not render app store links for TOTP factor', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm
          {...createMockQRCodeEnrollmentFormProps({ factorType: FACTOR_TYPE_TOTP })}
        />,
      );

      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });
  });

  describe('interactions', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ onClose })} />,
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onPhaseChange with enter-otp when continue is clicked for TOTP', async () => {
      const user = userEvent.setup();
      const onPhaseChange = vi.fn();

      renderWithProviders(
        <QRCodeEnrollmentForm
          {...createMockQRCodeEnrollmentFormProps({
            factorType: FACTOR_TYPE_TOTP,
            onPhaseChange,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(onPhaseChange).toHaveBeenCalledWith('enter-otp');
    });

    it('calls onContinueQRScan when continue is clicked for push notification', async () => {
      const user = userEvent.setup();
      const onContinueQRScan = vi.fn();

      renderWithProviders(
        <QRCodeEnrollmentForm
          {...createMockQRCodeEnrollmentFormProps({
            factorType: FACTOR_TYPE_PUSH_NOTIFICATION,
            onContinueQRScan,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(onContinueQRScan).toHaveBeenCalledTimes(1);
    });

    it('continue button is disabled when confirming', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ isConfirming: true })} />,
      );

      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('cancel button is accessible', () => {
      renderWithProviders(
        <QRCodeEnrollmentForm {...createMockQRCodeEnrollmentFormProps({ phase: 'scan' })} />,
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });
});
