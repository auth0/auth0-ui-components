import * as React from 'react';

import {
  getComponentStyles,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@auth0-web-ui-components/core';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CopyableTextField } from '@/components/ui/copyable-text-field';
import { QRCodeDisplayer } from '@/components/ui/qr-code';

import { QR_PHASE_ENTER_OTP, QR_PHASE_SCAN, SHOW_RECOVERY_CODE } from '@/lib/mfa-constants';

import { useTheme, useTranslator } from '@/hooks';
import { useOtpEnrollment } from '@/hooks/mfa';

import { OTPVerificationForm } from './otp-verification-form';
import { ShowRecoveryCode } from './show-recovery-code';
import { QRCodeEnrollmentFormProps } from '@/types';
import { cn } from '@/lib/theme-utils';

const PHASES = {
  SCAN: QR_PHASE_SCAN,
  ENTER_OTP: QR_PHASE_ENTER_OTP,
  SHOW_RECOVERY: SHOW_RECOVERY_CODE,
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
}: QRCodeEnrollmentFormProps) {
  const [phase, setPhase] = React.useState<Phase>(QR_PHASE_SCAN);
  const { t } = useTranslator('mfa');
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

  const handleContinue = React.useCallback(() => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      // Check if recovery codes exist for push notification
      if (otpData?.recoveryCodes && otpData.recoveryCodes.length > 0) {
        setPhase(PHASES.SHOW_RECOVERY);
      } else {
        resetOtpData();
        onClose();
      }
    } else {
      setPhase(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, otpData?.recoveryCodes, onClose]);

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
                  barcodeUri={otpData.barcodeUri || ''}
                  alt={t('enrollment_form.show_otp.qr_code_description')}
                />
              </div>
              <p
                id="qr-description"
                className={cn(
                  'font-normal block text-sm text-center text-(length:--font-size-paragraph)',
                )}
              >
                {factorType === FACTOR_TYPE_OTP
                  ? t('enrollment_form.show_otp.title')
                  : t('enrollment_form.show_auth0_guardian_title')}
              </p>
            </div>

            <div className="flex flex-col gap-3 justify-center" aria-describedby="qr-description">
              <CopyableTextField
                value={otpData?.secret || otpData?.barcodeUri || ''}
                label={t('enrollment_form.show_otp.secret_code')}
              />

              <div className="mt-3" />
              <Button
                type="button"
                className="text-sm"
                size="lg"
                onClick={handleContinue}
                aria-label={t('continue')}
              >
                {t('continue')}
              </Button>
              <Button
                type="button"
                className="text-sm"
                variant="ghost"
                size="lg"
                onClick={onClose}
                aria-label={t('cancel')}
              >
                {t('cancel')}
              </Button>
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
      oobCode={otpData.oobCode}
      recoveryCodes={otpData.recoveryCodes}
      onBack={handleBack}
      styling={styling}
    />
  );

  const renderRecoveryCodeScreen = () => (
    <ShowRecoveryCode
      recoveryCodes={otpData.recoveryCodes || []}
      onSuccess={onClose}
      styling={styling}
      onBack={handleBack}
      factorType={factorType}
    />
  );

  if (phase === PHASES.SHOW_RECOVERY) {
    return renderRecoveryCodeScreen();
  }

  return phase === QR_PHASE_SCAN ? renderQrScreen() : renderOtpScreen();
}
