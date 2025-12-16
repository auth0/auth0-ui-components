import { normalizeError, type MFAType } from '@auth0/universal-components-core';
import { useState, useCallback } from 'react';

import { CONFIRM } from '../../../lib/my-account/mfa-constants';
import { useTranslator } from '../../use-translator';

type OtpForm = {
  userOtp: string;
};

type UseOtpConfirmationProps = {
  factorType: MFAType;
  authSession: string;
  authenticationMethodId: string;
  confirmEnrollment: (
    factor: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
};

export function useOtpConfirmation({
  factorType,
  authSession,
  authenticationMethodId,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
}: UseOtpConfirmationProps) {
  const { t } = useTranslator('mfa');
  const [loading, setLoading] = useState(false);

  const onSubmitOtp = useCallback(
    async (data: OtpForm) => {
      if (loading) return;
      setLoading(true);

      try {
        const options = {
          userOtpCode: data.userOtp,
        };

        const response = await confirmEnrollment(
          factorType,
          authSession,
          authenticationMethodId,
          options,
        );
        if (response) {
          onSuccess();
          onClose();
        }
      } catch (err) {
        const normalizedError = normalizeError(err, {
          resolver: (code) =>
            t(
              `errors.${factorType}.${code}`,
              {},
              'An unexpected error occurred during enrollment.',
            ),
        });
        onError(normalizedError, CONFIRM);
      } finally {
        setLoading(false);
      }
    },
    [loading, factorType, confirmEnrollment, onError, onSuccess, onClose, t],
  );

  return { onSubmitOtp, loading };
}
