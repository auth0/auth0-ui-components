import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  normalizeError,
  type MFAType,
  type CreateAuthenticationMethodResponseContent,
} from '@auth0/universal-components-core';
import { useState, useCallback } from 'react';

import { ENROLL } from '../../../lib/mfa-constants';
import { useTranslator } from '../../use-translator';

type ContactForm = {
  contact: string;
};

type UseContactEnrollmentProps = {
  factorType: MFAType;
  enrollMfa: (
    factor: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
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
    contact: string;
    authenticationMethodId: string;
    authSession: string;
  }>({
    contact: '',
    authSession: '',
    authenticationMethodId: '',
  });

  const onSubmitContact = useCallback(
    async (data: ContactForm) => {
      if (loading) return;
      setLoading(true);
      try {
        const options: Record<string, string> =
          factorType === FACTOR_TYPE_EMAIL
            ? { email: data.contact }
            : factorType === FACTOR_TYPE_PHONE
              ? { phone_number: data.contact }
              : {};

        const response = await enrollMfa(factorType, options);
        const authenticationMethodId = 'id' in response ? response.id : '';

        setContactData({
          contact: data.contact,
          authenticationMethodId: authenticationMethodId,
          authSession: response.auth_session,
        });
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
