import {
  type CreateAuthenticationMethodResponseContent,
  normalizeError,
  type MFAType,
} from '@auth0/universal-components-core';
import { useState, useCallback } from 'react';

import { ENROLL } from '../../../lib/mfa-constants';
import { useTranslator } from '../../use-translator';

type UseRecoveryCodeGenerationProps = {
  factorType: MFAType;
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
  onError: (error: Error, stage: typeof ENROLL) => void;
  onClose: () => void;
};

export function useRecoveryCodeGeneration({
  factorType,
  enrollMfa,
  onError,
  onClose,
}: UseRecoveryCodeGenerationProps) {
  const { t } = useTranslator('mfa');
  const [loading, setLoading] = useState(false);
  const [recoveryCodeData, setRecoveryCodeData] = useState<{
    recoveryCode: string;
    authSession: string;
    authenticationMethodId: string;
  }>({
    recoveryCode: '',
    authSession: '',
    authenticationMethodId: '',
  });

  const fetchRecoveryCode = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await enrollMfa(factorType, {});
      setRecoveryCodeData({
        recoveryCode: 'recovery_code' in response ? response.recovery_code : '',
        authSession: 'auth_session' in response ? response.auth_session : '',
        authenticationMethodId: 'id' in response ? response.id : '',
      });
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) =>
          t(
            `errors.${factorType}.${code}`,
            {},
            'An unexpected error occurred during recovery code generation.',
          ),
      });
      onError(normalizedError, ENROLL);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [loading, factorType, enrollMfa, onError, onClose, t]);

  const resetRecoveryCodeData = useCallback(() => {
    setRecoveryCodeData({
      recoveryCode: '',
      authSession: '',
      authenticationMethodId: '',
    });
    setLoading(false);
  }, []);

  return {
    fetchRecoveryCode,
    recoveryCodeData,
    resetRecoveryCodeData,
    loading,
  };
}
