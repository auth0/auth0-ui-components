/**
 * QR code MFA enrollment form.
 * @module qr-code-enrollment-form
 * @internal
 */

import {
  getComponentStyles,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OTPVerificationForm } from './otp-verification-form';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Link } from '@/components/ui/link';
import { QRCodeDisplayer } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  QR_PHASE_ENTER_OTP,
  QR_PHASE_SCAN,
  GUARDIAN_APP_STORE_URL,
  GUARDIAN_PLAY_STORE_URL,
} from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import type { QRCodeEnrollmentFormProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

const DEFAULT_STYLING: QRCodeEnrollmentFormProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * QR code enrollment form for MFA factor setup.
 * @param props - Component props.
 * @param props.factorType - The MFA factor type being enrolled
 * @param props.otpData - QR barcode URI and manual input code
 * @param props.isEnrolling - Whether enrollment data is loading
 * @param props.isConfirming - Whether OTP confirmation is in progress
 * @param props.phase - Current QR enrollment phase (scan or enter-otp)
 * @param props.onContinueQRScan - Called when the user confirms the push notification scan
 * @param props.onConfirmOtp - Called with the 6-digit OTP code on submit
 * @param props.onClose - Callback fired when the dialog should close
 * @param props.onPhaseChange - Callback to advance or rewind the QR phase
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function QRCodeEnrollmentForm({
  factorType,
  otpData: { barcodeUri, manualInputCode },
  isEnrolling,
  isConfirming,
  phase,
  onContinueQRScan,
  onConfirmOtp,
  onClose,
  onPhaseChange,
  styling = DEFAULT_STYLING,
  customMessages = {},
}: QRCodeEnrollmentFormProps) {
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleContinue = React.useCallback(async () => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      await onContinueQRScan();
    } else {
      onPhaseChange(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, onContinueQRScan, onPhaseChange]);

  const handleBack = React.useCallback(() => {
    onPhaseChange(QR_PHASE_SCAN);
  }, [onPhaseChange]);

  if (phase !== QR_PHASE_SCAN) {
    return (
      <OTPVerificationForm
        factorType={factorType}
        isConfirming={isConfirming}
        onConfirmOtp={onConfirmOtp}
        onBack={handleBack}
        styling={styling}
        customMessages={customMessages}
      />
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full">
      {isEnrolling ? (
        <div className="flex items-center justify-center w-full" role="status" aria-live="polite">
          <Spinner aria-label={t('loading_text')} />
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex justify-center items-center">
            <QRCodeDisplayer
              size={150}
              value={barcodeUri}
              alt={
                factorType === FACTOR_TYPE_TOTP
                  ? t('enrollment.totp.qr_alt')
                  : t('enrollment.push.qr_alt')
              }
            />
          </div>
          <p className="text-base font-semibold text-center text-primary mt-10">
            {factorType === FACTOR_TYPE_TOTP
              ? t('enrollment.totp.scan_title')
              : t('enrollment.push.scan_title')}
          </p>
          <p
            id="qr-description"
            className="font-normal block text-left text-paragraph text-primary"
          >
            {factorType === FACTOR_TYPE_TOTP
              ? t('enrollment.totp.scan_description')
              : t('enrollment.push.scan_description')}
          </p>
          <div aria-describedby="qr-description">
            <CopyableTextField value={manualInputCode || barcodeUri} />
          </div>
          {factorType === FACTOR_TYPE_PUSH_NOTIFICATION && (
            <p className="text-paragraph text-muted-foreground">
              {t('enrollment.push.download_hint')}{' '}
              <Link
                href={GUARDIAN_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
              >
                {t('enrollment.push.download_hint_apple')}
              </Link>
              {` ${t('enrollment.push.download_hint_or')} `}
              <Link
                href={GUARDIAN_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
              >
                {t('enrollment.push.download_hint_google')}
              </Link>
              .
            </p>
          )}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              className="text-sm"
              variant="outline"
              size="default"
              onClick={onClose}
              aria-label={t('actions.cancel_button_label')}
            >
              {t('actions.cancel_button_label')}
            </Button>
            <Button
              type="button"
              className="text-sm"
              size="default"
              onClick={handleContinue}
              disabled={isConfirming}
              aria-label={t('actions.continue_button_label')}
            >
              {t('actions.continue_button_label')}
            </Button>
          </DialogFooter>
        </div>
      )}
    </div>
  );
}
