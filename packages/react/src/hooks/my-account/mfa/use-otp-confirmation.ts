import { normalizeError, type MFAType } from '@auth0-web-ui-components/core';
import { useState, useCallback } from 'react';

import { useTranslator } from '@/hooks';
import { CONFIRM } from '@/lib/mfa-constants';

type OtpForm = {
  userOtp: string;
};

type UseOtpConfirmationProps = {
  factorType: MFAType;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
};

export function useOtpConfirmation({
  factorType,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
}: UseOtpConfirmationProps) {
  const { t } = useTranslator('mfa');
  const [loading, setLoading] = useState(false);

  const onSubmitOtp = useCallback(
    async (data: OtpForm, oobCode?: string) => {
      if (loading) return;
      setLoading(true);

      try {
        const options = {
          oobCode,
          userOtpCode: data.userOtp,
        };

        const response = await confirmEnrollment(factorType, options);
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
