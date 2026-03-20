/**
 * MFA step-up operations hook.
 * @module use-mfa-step-up
 * @internal
 */

import {
  type EnrollParams,
  type MfaRequiredError,
  type VerifyParams,
} from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';

interface UseMfaStepUpProps {
  error: MfaRequiredError;
  onComplete: () => void;
}

/**
 * Wraps MFA step-up API operations with error handling and shared loading state.
 *
 * @param props - Hook configuration.
 * @param props.error - The MFA required error containing the `mfa_token`.
 * @param props.onComplete - Called after a successful `verify`.
 * @returns `enroll`, `challenge`, `verify`, and `isLoading`.
 * @internal
 */
export function useMfaStepUp({ error, onComplete }: UseMfaStepUpProps) {
  const { coreClient } = useCoreClient();
  const handleError = useErrorHandler();
  const stepUpClient = coreClient!.getMFAStepUpApiClient();

  const mfaToken = error.mfa_token;
  const [isLoading, setIsLoading] = useState(false);

  const enroll = useCallback(
    async (params: EnrollParams) => {
      setIsLoading(true);
      try {
        return await stepUpClient.enroll(params);
      } catch (err) {
        handleError(err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [stepUpClient, handleError],
  );

  const challenge = useCallback(
    async (authenticator: { id?: string }) => {
      try {
        return await stepUpClient.challenge({
          mfaToken,
          challengeType: 'oob',
          authenticatorId: authenticator.id,
        });
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [mfaToken, stepUpClient, handleError],
  );

  const verify = useCallback(
    async (params: VerifyParams) => {
      setIsLoading(true);
      try {
        await stepUpClient.verify(params);
        onComplete();
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [stepUpClient, handleError, onComplete],
  );

  return { enroll, challenge, verify, isLoading };
}
