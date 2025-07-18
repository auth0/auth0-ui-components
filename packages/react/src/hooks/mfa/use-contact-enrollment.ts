import { useState, useCallback } from 'react';
import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { FACTOR_TYPE_EMAIL, FACTOR_TYPE_SMS, FACTOR_TYPE_OTP, ENROLL } from '@/lib/constants';
import { useTranslator } from '@/hooks';

type ContactForm = {
  contact: string;
};

type UseContactEnrollmentProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  onError: (error: Error, stage: typeof ENROLL) => void;
  onContactSuccess: (oobCode?: string, contact?: string) => void;
  onOtpSuccess: (otpData: {
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
  }) => void;
};

export function useContactEnrollment({
  factorType,
  enrollMfa,
  onError,
  onContactSuccess,
  onOtpSuccess,
}: UseContactEnrollmentProps) {
  const t = useTranslator('mfa');
  const [loading, setLoading] = useState(false);

  const onSubmitContact = useCallback(
    async (data: ContactForm) => {
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
          onContactSuccess(response.oob_code, data.contact);
        }

        if (response?.authenticator_type === FACTOR_TYPE_OTP) {
          onOtpSuccess({
            secret: response.secret ?? null,
            barcodeUri: response.barcode_uri ?? null,
            recoveryCodes: response.recovery_codes || [],
          });
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
    },
    [factorType, enrollMfa, onContactSuccess, onOtpSuccess, onError, t],
  );

  return { onSubmitContact, loading };
}
