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
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_TOPT,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  ENROLL,
  CONFIRM,
} from '@/lib/constants';
import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { useTranslator } from '@/hooks';

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

type ContactForm = {
  contact: string;
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
  const [otpData, setOtpData] = React.useState<{
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
  }>({
    secret: null,
    barcodeUri: null,
    recoveryCodes: [],
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPhase(null); // reset phase to null when dialog closes
      setOobCode(undefined);
      setOtpData({ secret: null, barcodeUri: null, recoveryCodes: [] });
      setLoading(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (open && (factorType === FACTOR_TYPE_EMAIL || factorType === FACTOR_TYPE_SMS)) {
      setPhase(ENTER_CONTACT);
    }
  }, [open, factorType]);

  const onSubmitContact = async (data: ContactForm) => {
    setLoading(true);
    try {
      const options: Record<string, string> =
        factorType === FACTOR_TYPE_EMAIL
          ? { email: data.contact }
          : factorType === FACTOR_TYPE_SMS
            ? { phone_number: data.contact }
            : {};

      const response = await enrollMfa(factorType, options);

      if (response?.oob_code) {
        setOobCode(response.oob_code);
        setPhase(ENTER_OTP);
      }

      if (response?.authenticator_type === FACTOR_TYPE_OTP) {
        setOtpData({
          secret: response.secret ?? null,
          barcodeUri: response.barcode_uri ?? null,
          recoveryCodes: response.recovery_codes || [],
        });
        setPhase(SHOW_OTP);
      }
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, ENROLL);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpForm) => {
    setLoading(true);

    try {
      const options = {
        oobCode,
        ...(factorType === FACTOR_TYPE_EMAIL
          ? { userEmailOtpCode: data.userOtp }
          : { userOtpCode: data.userOtp }),
      };

      const response = await confirmEnrollment(factorType, options);
      if (response) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      const normalizedError = normalizeError(err, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, CONFIRM);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtpEnrollment = React.useCallback(async () => {
    try {
      const response = await enrollMfa(factorType, {});
      if (response?.authenticator_type === FACTOR_TYPE_OTP) {
        setOtpData({
          secret: response.secret ?? null,
          barcodeUri: response.barcode_uri ?? null,
          recoveryCodes: response.recovery_codes || [],
        });
      }
      setPhase(SHOW_OTP);
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, ENROLL);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [factorType, enrollMfa, onError, onClose, t]);

  // Automatically initiate OTP enrollment when factorType is 'totp' or 'push-notification'
  React.useEffect(() => {
    if (
      [FACTOR_TYPE_TOPT, FACTOR_TYPE_PUSH_NOTIFICATION].includes(factorType) &&
      !otpData.secret &&
      open
    ) {
      setLoading(true);
      fetchOtpEnrollment();
    }
  }, [factorType, fetchOtpEnrollment, otpData.secret, open]);

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
            barcodeUri={otpData.barcodeUri || ''}
            recoveryCodes={otpData.recoveryCodes}
            onSubmit={onSubmitOtp}
            loading={loading}
          />
        );
      case ENTER_OTP:
        return <OTPVerificationForm onSubmit={onSubmitOtp} loading={loading} />;
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
