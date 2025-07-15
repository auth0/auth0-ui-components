import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactInputForm } from './contact-input-form';
import { QRCodeEnrollmentForm } from './qr-code-enrollment-form';
import { OTPVerificationForm } from './otp-verification-form';
import {
  SHOW_OTP,
  ENTER_OTP,
  ENTER_CONTACT,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_TOPT,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  ENROLL,
  CONFIRM,
} from '@/lib/constants';
import { type MFAType, type EnrollMfaResponse } from '@auth0-web-ui-components/core';
import { useTranslator } from '@/hooks';
import { useOtpEnrollment } from '@/hooks/mfa';

type UserMFASetupFormProps = {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
};

type EnrollmentPhase = typeof ENTER_CONTACT | typeof ENTER_OTP | typeof SHOW_OTP | null;

export function UserMFASetupForm({
  open,
  onClose,
  factorType,
  enrollMfa,
  confirmEnrollment,
  onSuccess,
  onError,
}: UserMFASetupFormProps) {
  const t = useTranslator('mfa');

  // Initialize phase as null, meaning no UI shown by default
  const [phase, setPhase] = React.useState<EnrollmentPhase>(null);
  const [oobCode, setOobCode] = React.useState<string | undefined>(undefined);

  const otpEnrollment = useOtpEnrollment({
    factorType,
    enrollMfa,
    onError,
    onClose,
  });

  React.useEffect(() => {
    if (!open) {
      setPhase(null); // reset phase to null when dialog closes
      setOobCode(undefined);
      otpEnrollment.resetOtpData();
    }
  }, [open, otpEnrollment]);

  React.useEffect(() => {
    if (open && (factorType === FACTOR_TYPE_EMAIL || factorType === FACTOR_TYPE_SMS)) {
      setPhase(ENTER_CONTACT);
    }
  }, [open, factorType]);

  // Automatically initiate OTP enrollment when factorType is 'totp' or 'push-notification'
  React.useEffect(() => {
    if (
      [FACTOR_TYPE_TOPT, FACTOR_TYPE_PUSH_NOTIFICATION].includes(factorType) &&
      !otpEnrollment.otpData.secret &&
      open
    ) {
      otpEnrollment.fetchOtpEnrollment().then(() => {
        setPhase(SHOW_OTP);
      });
    }
  }, [factorType, otpEnrollment, open]);

  // Callback functions for form components
  const handleContactSuccess = React.useCallback((oobCode?: string) => {
    setOobCode(oobCode);
    setPhase(ENTER_OTP);
  }, []);

  const handleOtpSuccess = React.useCallback(
    (otpData: { secret: string | null; barcodeUri: string | null; recoveryCodes: string[] }) => {
      otpEnrollment.resetOtpData();
      // Set the data directly to the otp enrollment hook
      Object.assign(otpEnrollment.otpData, otpData);
      setPhase(SHOW_OTP);
    },
    [otpEnrollment],
  );

  // Render the appropriate form based on the current phase and factorType
  const renderForm = () => {
    switch (phase) {
      case ENTER_CONTACT:
        return (
          <ContactInputForm
            factorType={factorType}
            enrollMfa={enrollMfa}
            onError={onError}
            onContactSuccess={handleContactSuccess}
            onOtpSuccess={handleOtpSuccess}
          />
        );
      case SHOW_OTP:
        return (
          <QRCodeEnrollmentForm
            factorType={factorType}
            barcodeUri={otpEnrollment.otpData.barcodeUri || ''}
            recoveryCodes={otpEnrollment.otpData.recoveryCodes}
            confirmEnrollment={confirmEnrollment}
            onError={onError}
            onSuccess={onSuccess}
            onClose={onClose}
            oobCode={oobCode}
          />
        );
      case ENTER_OTP:
        return (
          <OTPVerificationForm
            factorType={factorType}
            confirmEnrollment={confirmEnrollment}
            onError={onError}
            onSuccess={onSuccess}
            onClose={onClose}
            oobCode={oobCode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(phase)} onOpenChange={onClose}>
      <DialogContent aria-describedby={factorType}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {factorType === FACTOR_TYPE_EMAIL
              ? t('enrollment_form.enroll_email')
              : factorType === FACTOR_TYPE_SMS
                ? t('enrollment_form.enroll_sms')
                : t('enroll_otp_mfa')}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
