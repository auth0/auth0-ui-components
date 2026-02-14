import {
  type CreateAuthenticationMethodResponseContent,
  normalizeError,
  type MFAType,
} from '@auth0/universal-components-core';
import { useState, useCallback } from 'react';

import { useTranslator } from '@/hooks/shared/use-translator';
import { ENROLL } from '@/lib/constants/my-account/mfa/mfa-constants';

type UseOtpEnrollmentProps = {
  factorType: MFAType;
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
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
    authSession: string;
    barcodeUri: string;
    authenticationMethodId: string;
    manualInputCode?: string;
  }>({
    authSession: '',
    barcodeUri: '',
    authenticationMethodId: '',
  });

  const fetchOtpEnrollment = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await enrollMfa(factorType, {});
      setOtpData({
        authSession: 'auth_session' in response ? response.auth_session : '',
        barcodeUri: 'barcode_uri' in response ? response.barcode_uri : '',
        authenticationMethodId: 'id' in response ? response.id : '',
        manualInputCode: 'manual_input_code' in response ? response.manual_input_code : '',
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
    setOtpData({
      authSession: '',
      barcodeUri: '',
      authenticationMethodId: '',
    });
    setLoading(false);
  }, []);

  return {
    fetchOtpEnrollment,
    otpData,
    resetOtpData,
    loading,
  };
}
