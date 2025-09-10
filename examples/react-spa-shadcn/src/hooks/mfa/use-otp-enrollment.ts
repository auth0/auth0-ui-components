import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { useState, useCallback } from 'react';

import { useTranslator } from '@/hooks/index';
import { ENROLL } from '@/lib/mfa-constants';

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
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
    oobCode: string | null;
  }>({
    secret: null,
    barcodeUri: null,
    recoveryCodes: [],
    oobCode: null,
  });

  const fetchOtpEnrollment = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await enrollMfa(factorType, {});
      setOtpData({
        secret: response.secret ?? null,
        barcodeUri: response.barcode_uri ?? null,
        recoveryCodes: response.recovery_codes || [],
        oobCode: response.oob_code ?? null,
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
    setOtpData({ secret: null, barcodeUri: null, recoveryCodes: [], oobCode: null });
    setLoading(false);
  }, []);

  const updateOtpData = useCallback(
    (newData: {
      secret: string | null;
      barcodeUri: string | null;
      recoveryCodes: string[];
      oobCode: string | null;
    }) => {
      setOtpData(newData);
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
