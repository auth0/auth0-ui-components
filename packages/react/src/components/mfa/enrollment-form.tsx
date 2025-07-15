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
import { useContactEnrollment } from '@/hooks/use-contact-enrollment';
import { useOtpConfirmation } from '@/hooks/use-otp-confirmation';
import { useOtpEnrollment } from '@/hooks/use-otp-enrollment';

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

type OtpForm = {
  userOtp: string;
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

  // Custom hooks for different enrollment flows
  const { onSubmitContact, loading: contactLoading } = useContactEnrollment({
    factorType,
    enrollMfa,
    onError,
    onContactSuccess: (oobCode) => {
      setOobCode(oobCode);
      setPhase(ENTER_OTP);
    },
    onOtpSuccess: (otpData) => {
      otpEnrollment.resetOtpData();
      // Set the data directly to the otp enrollment hook
      Object.assign(otpEnrollment.otpData, otpData);
      setPhase(SHOW_OTP);
    },
  });

  const { onSubmitOtp, loading: otpConfirmationLoading } = useOtpConfirmation({
    factorType,
    confirmEnrollment,
    onError,
    onSuccess,
    onClose,
  });

  const otpEnrollment = useOtpEnrollment({
    factorType,
    enrollMfa,
    onError,
    onClose,
  });

  // Combined loading state
  const loading = contactLoading || otpConfirmationLoading || otpEnrollment.loading;

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

  // Handler for OTP submission that includes the oobCode
  const handleOtpSubmit = React.useCallback(
    (data: OtpForm) => {
      onSubmitOtp(data, oobCode);
    },
    [onSubmitOtp, oobCode],
  );

  // Render the appropriate form based on the current phase and factorType
  const renderForm = () => {
    switch (phase) {
      case ENTER_CONTACT:
        return (
          <ContactInputForm factorType={factorType} onSubmit={onSubmitContact} loading={loading} />
        );
      case SHOW_OTP:
        return (
          <QRCodeEnrollmentForm
            barcodeUri={otpEnrollment.otpData.barcodeUri || ''}
            recoveryCodes={otpEnrollment.otpData.recoveryCodes}
            onSubmit={handleOtpSubmit}
            loading={loading}
          />
        );
      case ENTER_OTP:
        return <OTPVerificationForm onSubmit={handleOtpSubmit} loading={loading} />;
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
