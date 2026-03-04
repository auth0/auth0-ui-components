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

interface StepUpState {
  step: StepUpChallengeState;
  selectedAuthenticator: StepUpAuthenticator | null;
  challengeResponse: ChallengeResponse | null;
  isChallenging: boolean;
  isVerifying: boolean;
  error: string | null;
}

const INITIAL_STATE: StepUpState = {
  step: 'LIST',
  selectedAuthenticator: null,
  challengeResponse: null,
  isChallenging: false,
  isVerifying: false,
  error: null,
};

/**
 * Manages the List → Challenge → Verify state machine for MFA step-up authentication.
 * @param options - Hook options.
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

      // Recovery codes skip the challenge step — go straight to verify
      if (auth.authenticatorType === 'recovery-code') {
        setChallengeState((prev) => ({
          ...prev,
          step: 'VERIFY',
          selectedAuthenticator: auth,
          challengeResponse: null,
        }));
        return;
      }

      setChallengeState((prev) => ({
        ...prev,
        isChallenging: true,
        selectedAuthenticator: auth,
        error: null,
      }));
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
          challengeResponse: response,
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
      if (!stepUpService || !challengeState.selectedAuthenticator) return;
      const { selectedAuthenticator, challengeResponse } = challengeState;

      // Recovery codes verify directly; OTP/OOB require a prior challenge response
      if (selectedAuthenticator.authenticatorType !== 'recovery-code' && !challengeResponse) return;

      setChallengeState((prev) => ({ ...prev, isVerifying: true, error: null }));
      try {
        const params =
          selectedAuthenticator.authenticatorType === 'recovery-code'
            ? { mfaToken, recoveryCode: code }
            : challengeResponse!.challengeType === 'otp'
              ? { mfaToken, otp: code }
              : { mfaToken, oobCode: challengeResponse!.oobCode, bindingCode: code };
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
    [
      challengeState.selectedAuthenticator,
      challengeState.challengeResponse,
      mfaToken,
      stepUpService,
      onSuccess,
    ],
  );

  const handleBack = useCallback(() => setChallengeState(INITIAL_STATE), []);
  const clearError = useCallback(() => setChallengeState((prev) => ({ ...prev, error: null })), []);

  return {
    state: challengeState.step,
    selectedAuthenticator: challengeState.selectedAuthenticator,
    challengeResponse: challengeState.challengeResponse,
    isChallenging: challengeState.isChallenging,
    isVerifying: challengeState.isVerifying,
    error: challengeState.error,
    handleSelectAuthenticator,
    handleVerify,
    handleBack,
    clearError,
  };
}
