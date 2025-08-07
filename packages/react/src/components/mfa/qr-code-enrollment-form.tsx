import * as React from 'react';
import QRCode from 'react-qr-code';
import { Copy } from 'lucide-react';

import { type MFAType, type EnrollMfaResponse } from '@auth0-web-ui-components/core';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { CONFIRM, QR_PHASE_ENTER_OTP, QR_PHASE_SCAN, ENROLL } from '@/lib/mfa-constants';

import { useTranslator } from '@/hooks';
import { useOtpEnrollment } from '@/hooks/mfa';

import { OTPVerificationForm } from './otp-verification-form';
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
  currentStyles?: Record<string, string>;
};

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
  currentStyles = {},
}: QRCodeEnrollmentFormProps) {
  const [phase, setPhase] = React.useState<Phase>(QR_PHASE_SCAN);
  const { t } = useTranslator('mfa');

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
    setPhase(QR_PHASE_ENTER_OTP);
  }, []);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
    resetOtpData();
  }, []);

  const handleCopySecret = React.useCallback(async () => {
    await navigator.clipboard.writeText(otpData?.secret || '');
  }, [otpData.secret]);

  const renderQrScreen = () => {
    return (
      <div style={currentStyles}>
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
                  'font-normal block text-sm text-center block text-(length:--font-size-paragraph)',
                )}
              >
                {t('enrollment_form.show_otp.title')}
              </p>
            </div>
            <div className="flex flex-col space-y-3" aria-describedby="qr-description">
              <Button
                type="button"
                className="text-sm"
                variant="outline"
                size="lg"
                onClick={handleCopySecret}
                aria-label={t('enrollment_form.show_otp.copy_as_code')}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {t('enrollment_form.show_otp.copy_as_code')}
              </Button>
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
      oobCode={otpData?.oobCode || ''}
      onBack={handleBack}
      currentStyles={currentStyles}
    />
  );

  return phase === QR_PHASE_SCAN ? renderQrScreen() : renderOtpScreen();
}
