import { FACTOR_TYPE_RECOVERY_CODE, type MfaRequiredError } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';

/**
 * Resolves MFA enrollment factors and active authenticators for a step-up flow.
 *
 * Fetches enrollment factors (normal mode) or authenticators (proxy mode), falling back to
 * `error.mfa_requirements.enroll` when in proxy mode with no active authenticators.
 *
 * @param error - The MFA required error containing the `mfa_token` and optional requirements.
 * @returns Resolved `factors`, `authenticators`, `isEnrollMode`, and `isLoading`.
 * @internal
 */
export function useMfaRequirements(error: MfaRequiredError) {
  const { coreClient } = useCoreClient();
  const handleError = useErrorHandler();
  const mfaToken = error.mfa_token;

  const stepUpClient = coreClient?.getMFAStepUpApiClient();
  const isProxyMode = !!coreClient?.isProxyMode();

  const enrollment = useQuery({
    queryKey: ['mfa-enrollment-factors', mfaToken],
    queryFn: () => stepUpClient!.getEnrollmentFactors!(mfaToken),
    enabled: !!stepUpClient && !!stepUpClient.getEnrollmentFactors && !isProxyMode,
    select: (factors) => factors.filter((f) => f.type !== FACTOR_TYPE_RECOVERY_CODE),
    retry: false,
  });

  const authenticators = useQuery({
    queryKey: ['mfa-authenticators', mfaToken],
    queryFn: () => stepUpClient!.getAuthenticators(mfaToken),
    enabled: !!stepUpClient && (isProxyMode || (enrollment.isSuccess && !enrollment.data.length)),
    select: (items) => items.filter((a) => a.active),
    retry: false,
  });

  useEffect(() => {
    if (enrollment.isError) handleError(enrollment.error);
  }, [enrollment.isError, enrollment.error, handleError]);

  useEffect(() => {
    if (authenticators.isError) handleError(authenticators.error);
  }, [authenticators.isError, authenticators.error, handleError]);

  const factors = useMemo(() => {
    if (isProxyMode) {
      if (authenticators.isSuccess && authenticators.data.length === 0) {
        return (error.mfa_requirements?.enroll ?? []).filter(
          (f) => f.type !== FACTOR_TYPE_RECOVERY_CODE,
        );
      }
      return [];
    }
    return enrollment.data ?? [];
  }, [enrollment.data, authenticators.isSuccess, authenticators.data, isProxyMode, error]);

  return {
    factors,
    authenticators: authenticators.data ?? [],
    isEnrollMode: factors.length > 0,
    isLoading: enrollment.isLoading || authenticators.isLoading,
  };
}
