import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { useState, useCallback } from 'react';

import { useTranslator } from '@/hooks/index';
import { ENROLL } from '@/lib/mfa-constants';

type ContactForm = {
  contact: string;
};

type UseContactEnrollmentProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  onError: (error: Error, stage: typeof ENROLL) => void;
};

export function useContactEnrollment({
  factorType,
  enrollMfa,
  onError,
}: UseContactEnrollmentProps) {
  const { t } = useTranslator('mfa');
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState<{
    contact: string | null;
    oobCode: string | null;
  }>({
    contact: null,
    oobCode: null,
  });

  const onSubmitContact = useCallback(
    async (data: ContactForm) => {
      if (loading) return;
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
          setContactData({
            contact: data.contact,
            oobCode: response?.oob_code,
          });
        }
      } catch (error) {
        const normalizedError = normalizeError(error, {
          resolver: (code) =>
            t(
              `errors.${factorType}.${code}`,
              {},
              'An unexpected error occurred during enrollment.',
            ),
        });
        onError(normalizedError, ENROLL);
      } finally {
        setLoading(false);
      }
    },
    [loading, factorType, enrollMfa, onError, t],
  );

  return { onSubmitContact, loading, contactData, setContactData };
}
