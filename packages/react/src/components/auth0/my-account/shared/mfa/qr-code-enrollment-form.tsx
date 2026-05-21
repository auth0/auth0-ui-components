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

import { OTPVerificationForm } from '@/components/auth0/my-account/shared/mfa/otp-verification-form';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { QRCodeDisplayer } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { QR_PHASE_ENTER_OTP, QR_PHASE_SCAN } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { QRCodeEnrollmentFormProps } from '@/types/my-account/mfa/mfa-types';

type Phase = typeof QR_PHASE_SCAN | typeof QR_PHASE_ENTER_OTP;

/**
 *
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.barcodeUri - QR code URI to display
 * @param props.manualInputCode - Manual input code fallback
 * @param props.isEnrolling - Whether enrollment data is loading
 * @param props.isConfirming - Whether OTP confirmation is in progress
 * @param props.onContinueQR - Called when continuing past QR scan (push notification confirm)
 * @param props.onConfirmOtp - Called with the 6-digit OTP code (TOTP)
 * @param props.onClose - Callback fired when the component should close
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function QRCodeEnrollmentForm({
  factorType,
  barcodeUri,
  manualInputCode,
  isEnrolling,
  isConfirming,
  onContinueQR,
  onConfirmOtp,
  onClose,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: QRCodeEnrollmentFormProps) {
  const [phase, setPhase] = React.useState<Phase>(QR_PHASE_SCAN);
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleContinue = React.useCallback(async () => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      await onContinueQR();
    } else {
      setPhase(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, onContinueQR]);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
  }, []);

  const renderQrScreen = () => (
    <div style={currentStyles.variables} className="w-full">
      {isEnrolling ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Spinner aria-label={t('loading')} />
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="mb-6">
            <div className="flex justify-center items-center mb-6">
              <QRCodeDisplayer
                size={150}
                value={barcodeUri}
                alt={t('enrollment_form.show_otp.qr_code_description')}
              />
            </div>
            <p
              id="qr-description"
              className="font-normal block text-sm text-center text-(length:--font-size-paragraph) text-primary"
            >
              {factorType === FACTOR_TYPE_TOTP
                ? t('enrollment_form.show_otp.title')
                : t('enrollment_form.show_auth0_guardian_title')}
            </p>
          </div>

          <div aria-describedby="qr-description">
            <CopyableTextField value={manualInputCode || barcodeUri} />

            <div className="flex flex-row justify-end gap-3 mt-6 mb-6">
              <Button
                type="button"
                className="text-sm"
                variant="outline"
                size="default"
                onClick={onClose}
                aria-label={t('cancel')}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                className="text-sm"
                size="default"
                onClick={handleContinue}
                disabled={isConfirming}
                aria-label={t('continue')}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOtpScreen = () => (
    <OTPVerificationForm
      factorType={factorType}
      isConfirming={isConfirming}
      onConfirmOtp={onConfirmOtp}
      onBack={handleBack}
      styling={styling}
      customMessages={customMessages}
    />
  );

  return phase === QR_PHASE_SCAN ? renderQrScreen() : renderOtpScreen();
}
