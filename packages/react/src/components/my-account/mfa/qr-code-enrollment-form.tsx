import {
  getComponentStyles,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { useOtpEnrollment } from '../../../hooks/my-account/mfa/use-otp-enrollment';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { QR_PHASE_ENTER_OTP, QR_PHASE_SCAN } from '../../../lib/my-account/mfa-constants';
import { cn } from '../../../lib/utils';
import type { QRCodeEnrollmentFormProps } from '../../../types/my-account/mfa/mfa-types';
import { Button } from '../../ui/button';
import { CopyableTextField } from '../../ui/copyable-text-field';
import { QRCodeDisplayer } from '../../ui/qr-code';
import { Spinner } from '../../ui/spinner';

import { OTPVerificationForm } from './otp-verification-form';

const PHASES = {
  SCAN: QR_PHASE_SCAN,
  ENTER_OTP: QR_PHASE_ENTER_OTP,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export function QRCodeEnrollmentForm({
  factorType,
  enrollMfa,
  confirmEnrollment,
  onError,
  onSuccess,
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

  const { fetchOtpEnrollment, otpData, resetOtpData, loading } = useOtpEnrollment({
    factorType,
    enrollMfa,
    onError,
    onClose,
  });

  React.useEffect(() => {
    // Only fetch if we don't have data and we're in scan phase
    if (!otpData?.barcodeUri) {
      fetchOtpEnrollment();
    }
  }, [otpData?.barcodeUri, fetchOtpEnrollment]);

  const handleContinue = React.useCallback(async () => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      try {
        await confirmEnrollment(
          factorType,
          otpData.authSession,
          otpData.authenticationMethodId,
          {},
        );

        onSuccess();
        resetOtpData();
        onClose();
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'), 'confirm');
      }
    } else {
      setPhase(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, otpData, confirmEnrollment, onSuccess, onError, resetOtpData, onClose]);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
  }, []);

  const renderQrScreen = () => {
    return (
      <div style={currentStyles.variables} className="w-full">
        {loading ? (
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
                  value={otpData.barcodeUri}
                  alt={t('enrollment_form.show_otp.qr_code_description')}
                />
              </div>
              <p
                id="qr-description"
                className={cn(
                  'font-normal block text-sm text-center text-(length:--font-size-paragraph) text-primary',
                )}
              >
                {factorType === FACTOR_TYPE_TOTP
                  ? t('enrollment_form.show_otp.title')
                  : t('enrollment_form.show_auth0_guardian_title')}
              </p>
            </div>

            <div aria-describedby="qr-description">
              <CopyableTextField value={otpData.manualInputCode || otpData?.barcodeUri} />

              <div className="mt-3" />

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
  };

  const renderOtpScreen = () => (
    <OTPVerificationForm
      factorType={factorType}
      confirmEnrollment={confirmEnrollment}
      onError={onError}
      onSuccess={onSuccess}
      onClose={onClose}
      authSession={otpData.authSession}
      authenticationMethodId={otpData.authenticationMethodId}
      onBack={handleBack}
      styling={styling}
      customMessages={customMessages}
    />
  );

  return phase === QR_PHASE_SCAN ? renderQrScreen() : renderOtpScreen();
}
