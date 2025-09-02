import { useState, useCallback } from 'react';
import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { ENROLL } from '@/lib/mfa-constants';
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
  const { t } = useTranslator('mfa');
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState<{
    secret?: string;
    barcodeUri?: string;
    oobCode?: string;
    recoveryCodes?: string[];
  }>({});

  const fetchOtpEnrollment = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await enrollMfa(factorType, {});
      setOtpData({
        secret: response.secret,
        barcodeUri: response.barcode_uri,
        recoveryCodes: response.recovery_codes,
        oobCode: response.oob_code,
      });
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) =>
          t(`errors.${factorType}.${code}`, {}, 'An unexpected error occurred during enrollment.'),
      });
      onError(normalizedError, ENROLL);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [loading, factorType, enrollMfa, onError, onClose, t]);

  const resetOtpData = useCallback(() => {
    setOtpData({});
    setLoading(false);
  }, []);

  const updateOtpData = useCallback(
    (
      newData: Partial<{
        secret: string;
        barcodeUri: string;
        recoveryCodes: string[];
        oobCode: string;
      }>,
    ) => {
      setOtpData((prev) => ({
        ...prev,
        ...newData,
      }));
    },
    [],
  );

  return {
    fetchOtpEnrollment,
    otpData,
    resetOtpData,
    updateOtpData,
    loading,
  };
}
