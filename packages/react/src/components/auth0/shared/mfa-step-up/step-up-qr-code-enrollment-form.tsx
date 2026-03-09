import {
  getComponentStyles,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  type MFAType,
  type CreateAuthenticationMethodResponseContent,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OTPVerificationForm } from '@/components/auth0/my-account/shared/mfa/otp-verification-form';
import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { QRCodeDisplayer } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { useOtpEnrollment } from '@/hooks/my-account/use-otp-enrollment';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { QR_PHASE_ENTER_OTP, QR_PHASE_SCAN } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { ENROLL, CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';
import { cn } from '@/lib/utils';

const QR_PHASE_RECOVERY_CODE = 'RECOVERY_CODE' as const;

const PHASES = {
  SCAN: QR_PHASE_SCAN,
  ENTER_OTP: QR_PHASE_ENTER_OTP,
  RECOVERY_CODE: QR_PHASE_RECOVERY_CODE,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

interface StepUpQRCodeEnrollmentFormProps {
  factorType: MFAType;
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * QR code enrollment form for the step-up MFA flow.
 *
 * Receives `enrollMfa` and `confirmEnrollment` adapters from the parent
 * (`StepUpEnrollmentSetupForm`) that call the step-up API service methods
 * (`enroll()` and `verify()`) instead of the My Account API.
 * @param props - Component props.
 * @returns QR code enrollment form element.
 */
export function StepUpQRCodeEnrollmentForm({
  factorType,
  enrollMfa,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
}: StepUpQRCodeEnrollmentFormProps) {
  const [phase, setPhase] = React.useState<Phase>(QR_PHASE_SCAN);
  const { t } = useTranslator('mfa');
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () =>
      getComponentStyles(
        { variables: { common: {}, light: {}, dark: {} }, classes: {} },
        isDarkMode,
      ),
    [isDarkMode],
  );

  const [recoveryAcknowledged, setRecoveryAcknowledged] = React.useState(false);

  const { fetchOtpEnrollment, otpData, resetOtpData, loading } = useOtpEnrollment({
    factorType,
    enrollMfa,
    onError,
    onClose,
  });

  React.useEffect(() => {
    if (!otpData?.barcodeUri) {
      fetchOtpEnrollment();
    }
  }, [otpData?.barcodeUri]);

  const hasRecoveryCodes = otpData.recoveryCodes && otpData.recoveryCodes.length > 0;

  const handlePostConfirm = React.useCallback(() => {
    if (hasRecoveryCodes) {
      setPhase(QR_PHASE_RECOVERY_CODE);
    } else {
      onSuccess();
      resetOtpData();
      onClose();
    }
  }, [hasRecoveryCodes, onSuccess, resetOtpData, onClose]);

  const handleRecoveryContinue = React.useCallback(() => {
    onSuccess();
    resetOtpData();
    onClose();
  }, [onSuccess, resetOtpData, onClose]);

  /** QR scan Continue: Push → confirm directly, TOTP → go to OTP entry. */
  const handleContinue = React.useCallback(async () => {
    if (factorType === FACTOR_TYPE_PUSH_NOTIFICATION) {
      try {
        await confirmEnrollment(
          factorType,
          otpData.authSession,
          otpData.authenticationMethodId,
          {},
        );
        handlePostConfirm();
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'), 'confirm');
      }
    } else {
      setPhase(QR_PHASE_ENTER_OTP);
    }
  }, [factorType, otpData, confirmEnrollment, handlePostConfirm, onError]);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
  }, []);

  const renderQrScreen = () => (
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
              className={cn('font-normal block text-sm text-center text-primary')}
            >
              {factorType === FACTOR_TYPE_TOTP
                ? t('enrollment_form.show_otp.title')
                : t('enrollment_form.show_auth0_guardian_title')}
            </p>
          </div>

          <div aria-describedby="qr-description">
            <CopyableTextField value={otpData.manualInputCode || otpData?.barcodeUri} />

            <div className="mt-3" />

            <div className="flex flex-row justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('cancel')}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
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

  const renderRecoveryCodeScreen = () => (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
      <div className="space-y-6">
        <div>
          <p className={cn('font-normal block text-sm text-center mb-4 text-primary')}>
            {t('enrollment_form.recovery_code_description')}
          </p>
          <CopyableTextField value={otpData.recoveryCodes?.join(', ') ?? ''} />
        </div>

        <div className="flex items-center gap-2 justify-start">
          <Checkbox
            id="recovery-acknowledged"
            checked={recoveryAcknowledged}
            onCheckedChange={(checked) => setRecoveryAcknowledged(checked === true)}
          />
          <Label htmlFor="recovery-acknowledged" className="text-sm cursor-pointer">
            {t('enrollment_form.recovery_code_acknowledged')}
          </Label>
        </div>

        <div className="flex flex-row justify-center gap-3 mt-6">
          <Button
            variant="primary"
            size="sm"
            disabled={!recoveryAcknowledged}
            onClick={handleRecoveryContinue}
            aria-label={t('continue')}
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOtpScreen = () => (
    <OTPVerificationForm
      factorType={factorType}
      confirmEnrollment={confirmEnrollment}
      onError={onError}
      onSuccess={handlePostConfirm}
      onClose={onClose}
      authSession={otpData.authSession}
      authenticationMethodId={otpData.authenticationMethodId}
      onBack={handleBack}
      buttonSize="sm"
      buttonAlignment="justify-center"
    />
  );

  switch (phase) {
    case QR_PHASE_SCAN:
      return renderQrScreen();
    case QR_PHASE_RECOVERY_CODE:
      return renderRecoveryCodeScreen();
    case QR_PHASE_ENTER_OTP:
      return renderOtpScreen();
    default:
      return null;
  }
}
