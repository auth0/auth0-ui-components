import type { StepUpAuthenticator, ChallengeResponse } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';

export type StepUpChallengeState = 'LIST' | 'CHALLENGING' | 'VERIFY';

interface UseStepUpChallengeProps {
  mfaToken: string;
  onSuccess: () => Promise<void>;
}

export interface UseStepUpChallengeResult {
  state: StepUpChallengeState;
  selectedAuthenticator: StepUpAuthenticator | null;
  challengeResponse: ChallengeResponse | null;
  isChallenging: boolean;
  isVerifying: boolean;
  error: string | null;
  handleSelectAuthenticator: (auth: StepUpAuthenticator) => Promise<void>;
  handleVerify: (code: string) => Promise<void>;
  handleBack: () => void;
  clearError: () => void;
}

/**
 * Frozen mfa_token + challenge response pair.
 * Verify always uses the token that was active when the challenge was issued,
 * even if the parent re-renders with a fresh mfa_token before the user enters their code.
 */
interface FrozenChallenge {
  mfaToken: string;
  response: ChallengeResponse;
}

interface StepUpState {
  step: StepUpChallengeState;
  selectedAuthenticator: StepUpAuthenticator | null;
  frozenChallenge: FrozenChallenge | null;
  isChallenging: boolean;
  isVerifying: boolean;
  error: string | null;
}

const INITIAL_STATE: StepUpState = {
  step: 'LIST',
  selectedAuthenticator: null,
  frozenChallenge: null,
  isChallenging: false,
  isVerifying: false,
  error: null,
};

/**
 * Manages the List → Challenge → Verify state machine for MFA step-up authentication.
 * @param root0 - Hook options.
 * @returns Step-up challenge state and action handlers.
 */
export function useStepUpChallenge({
  mfaToken,
  onSuccess,
}: UseStepUpChallengeProps): UseStepUpChallengeResult {
  const { coreClient } = useCoreClient();
  const stepUpService = coreClient?.getStepUpApiService();
  const [challengeState, setChallengeState] = useState<StepUpState>(INITIAL_STATE);

  const handleSelectAuthenticator = useCallback(
    async (auth: StepUpAuthenticator) => {
      if (!stepUpService) return;
      setChallengeState((prev) => ({ ...prev, isChallenging: true, error: null }));
      try {
        const challengeType = auth.authenticatorType === 'otp' ? 'otp' : 'oob';
        const response = await stepUpService.challenge({
          mfaToken,
          challengeType,
          authenticatorId: auth.id,
        });
        setChallengeState((prev) => ({
          ...prev,
          step: 'VERIFY',
          selectedAuthenticator: auth,
          frozenChallenge: { mfaToken, response },
          isChallenging: false,
        }));
      } catch (err) {
        setChallengeState((prev) => ({
          ...prev,
          isChallenging: false,
          error: err instanceof Error ? err.message : 'Failed to start challenge',
        }));
      }
    },
    [mfaToken, stepUpService],
  );

  const handleVerify = useCallback(
    async (code: string) => {
      if (!challengeState.frozenChallenge || !stepUpService) return;
      const { mfaToken: frozenToken, response: challengeResponse } = challengeState.frozenChallenge;
      setChallengeState((prev) => ({ ...prev, isVerifying: true, error: null }));
      try {
        const params =
          challengeResponse.challengeType === 'otp'
            ? { mfaToken: frozenToken, otp: code }
            : { mfaToken: frozenToken, oobCode: challengeResponse.oobCode, bindingCode: code };
        await stepUpService.verify(params);
        await onSuccess();
      } catch (err) {
        setChallengeState((prev) => ({
          ...prev,
          isVerifying: false,
          error: err instanceof Error ? err.message : 'Verification failed',
        }));
      }
    },
    [challengeState.frozenChallenge, stepUpService, onSuccess],
  );

  const handleBack = useCallback(() => setChallengeState(INITIAL_STATE), []);
  const clearError = useCallback(() => setChallengeState((prev) => ({ ...prev, error: null })), []);

  return {
    state: challengeState.step,
    selectedAuthenticator: challengeState.selectedAuthenticator,
    challengeResponse: challengeState.frozenChallenge?.response ?? null,
    isChallenging: challengeState.isChallenging,
    isVerifying: challengeState.isVerifying,
    error: challengeState.error,
    handleSelectAuthenticator,
    handleVerify,
    handleBack,
    clearError,
  };
}
