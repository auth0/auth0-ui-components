import * as React from 'react';
import QRCode from 'react-qr-code';

import {
  type MFAType,
  type EnrollMfaResponse,
  getComponentStyles,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@auth0-web-ui-components/core';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CopyableTextField } from '@/components/ui/copyable-text-field';

import { CONFIRM, QR_PHASE_ENTER_OTP, QR_PHASE_SCAN, ENROLL } from '@/lib/mfa-constants';

import { useTheme, useTranslator } from '@/hooks';
import { useOtpEnrollment } from '@/hooks/mfa';

import { OTPVerificationForm } from './otp-verification-form';
import { ShowRecoveryCode } from './show-recovery-code';
import { Styling } from '@/types';
import { cn } from '@/lib/theme-utils';

type QRCodeEnrollmentFormProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  styling?: Styling;
};

const PHASES = {
  SCAN: QR_PHASE_SCAN,
  ENTER_OTP: QR_PHASE_ENTER_OTP,
  SHOW_RECOVERY: 'show_recovery',
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
    fetchOtpEnrollment();
  }, [phase]);

  const handleContinue = React.useCallback(() => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      // Check if recovery codes exist for push notification
      if (otpData?.recoveryCodes && otpData.recoveryCodes.length > 0) {
        setPhase(PHASES.SHOW_RECOVERY);
      } else {
        onClose();
      }
    } else {
      setPhase(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, otpData?.recoveryCodes, onClose]);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
    resetOtpData();
  }, [resetOtpData]);

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
                <QRCode
                  size={150}
                  value={otpData.barcodeUri || ''}
                  aria-label={t('enrollment_form.show_otp.qr_code_description')}
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
    />
  );

  if (phase === PHASES.SHOW_RECOVERY) {
    return renderRecoveryCodeScreen();
  }

  return phase === QR_PHASE_SCAN ? renderQrScreen() : renderOtpScreen();
}
