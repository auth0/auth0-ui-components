import { useState, useCallback } from 'react';
import { normalizeError, type MFAType } from '@auth0-web-ui-components/core';
import { FACTOR_TYPE_EMAIL, CONFIRM } from '@/lib/constants';
import { useTranslator } from '@/hooks';

type OtpForm = {
  userOtp: string;
};

type UseOtpConfirmationProps = {
  factorType: MFAType;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
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
  const t = useTranslator('mfa');
  const [loading, setLoading] = useState(false);

  const onSubmitOtp = useCallback(
    async (data: OtpForm, oobCode?: string) => {
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
    },
    [factorType, confirmEnrollment, onError, onSuccess, onClose, t],
  );

  return { onSubmitOtp, loading };
}
