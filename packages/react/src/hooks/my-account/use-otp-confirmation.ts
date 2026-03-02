/**
 * OTP confirmation hook for MFA enrollment.
 * @module use-otp-confirmation
 * @internal
 */

import { normalizeError, type MFAType } from '@auth0/universal-components-core';
import { useState, useCallback } from 'react';

import { useTranslator } from '@/hooks/shared/use-translator';
import { CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';

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

/**
 * Hook for OTP code confirmation during MFA enrollment.
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.authSession - Authentication session data
 * @param props.authenticationMethodId - ID of the authentication method
 * @param props.confirmEnrollment - Function to confirm MFA enrollment
 * @param props.onError - Callback fired when an error occurs
 * @param props.onSuccess - Callback fired on successful operation
 * @param props.onClose - Callback fired when the component should close
 * @internal
 * @returns Hook state and methods
 */
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
