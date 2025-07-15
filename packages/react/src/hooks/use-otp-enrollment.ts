import { useState, useCallback } from 'react';
import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { FACTOR_TYPE_OTP, ENROLL } from '@/lib/constants';
import { useTranslator } from '@/hooks';

type UseOtpEnrollmentProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  onError: (error: Error, stage: typeof ENROLL) => void;
  onClose: () => void;
};

export function useOtpEnrollment({
  factorType,
  enrollMfa,
  onError,
  onClose,
}: UseOtpEnrollmentProps) {
  const t = useTranslator('mfa');
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState<{
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
  }>({
    secret: null,
    barcodeUri: null,
    recoveryCodes: [],
  });

  const fetchOtpEnrollment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await enrollMfa(factorType, {});
      if (response?.authenticator_type === FACTOR_TYPE_OTP) {
        setOtpData({
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
      onClose();
    } finally {
      setLoading(false);
    }
  }, [factorType, enrollMfa, onError, onClose, t]);

  const resetOtpData = useCallback(() => {
    setOtpData({ secret: null, barcodeUri: null, recoveryCodes: [] });
    setLoading(false);
  }, []);

  return {
    fetchOtpEnrollment,
    otpData,
    resetOtpData,
    loading,
  };
}
