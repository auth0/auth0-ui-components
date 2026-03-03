import type {
  StepUpAuthenticator,
  ChallengeResponse,
  StepUpApiService,
} from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

export type StepUpChallengeState = 'LIST' | 'CHALLENGING' | 'VERIFY';

interface UseStepUpChallengeProps {
  mfaToken: string;
  stepUpService: StepUpApiService;
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
 * Stores the mfa_token that was active when a challenge was issued so that
 * verify() always uses the token that matches the oob_code, even if the parent
 * component receives a fresh mfa_required error with a new mfa_token before the
 * user finishes entering their code.
 */
interface FrozenChallenge {
  mfaToken: string;
  response: ChallengeResponse;
}

/**
 * Manages the List → Challenge → Verify state machine for MFA step-up authentication.
 */
export function useStepUpChallenge({
  mfaToken,
  stepUpService,
  onSuccess,
}: UseStepUpChallengeProps): UseStepUpChallengeResult {
  const [state, setState] = useState<StepUpChallengeState>('LIST');
  const [selectedAuthenticator, setSelectedAuthenticator] = useState<StepUpAuthenticator | null>(
    null,
  );
  // Frozen at challenge-time so verify always uses the oob_code / mfa_token pair
  // that Auth0 issued together, even if the parent re-renders with a fresh mfa_token.
  const [frozenChallenge, setFrozenChallenge] = useState<FrozenChallenge | null>(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAuthenticator = useCallback(
    async (auth: StepUpAuthenticator) => {
      setIsChallenging(true);
      setError(null);
      try {
        const challengeType = auth.authenticatorType === 'otp' ? 'otp' : 'oob';
        const response = await stepUpService.challenge({
          mfaToken,
          challengeType,
          authenticatorId: auth.id,
        });
        setSelectedAuthenticator(auth);
        // Freeze the mfaToken used for this challenge so verify uses the same pair.
        setFrozenChallenge({ mfaToken, response });
        setState('VERIFY');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start challenge');
      } finally {
        setIsChallenging(false);
      }
    },
    [mfaToken, stepUpService],
  );

  const handleVerify = useCallback(
    async (code: string) => {
      if (!frozenChallenge) return;
      const { mfaToken: frozenToken, response: challengeResponse } = frozenChallenge;
      setIsVerifying(true);
      setError(null);
      try {
        const params =
          challengeResponse.challengeType === 'otp'
            ? { mfaToken: frozenToken, otp: code }
            : { mfaToken: frozenToken, oobCode: challengeResponse.oobCode, bindingCode: code };
        await stepUpService.verify(params);
        await onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setIsVerifying(false);
      }
    },
    [frozenChallenge, stepUpService, onSuccess],
  );

  const handleBack = useCallback(() => {
    setState('LIST');
    setSelectedAuthenticator(null);
    setFrozenChallenge(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    selectedAuthenticator,
    challengeResponse: frozenChallenge?.response ?? null,
    isChallenging,
    isVerifying,
    error,
    handleSelectAuthenticator,
    handleVerify,
    handleBack,
    clearError,
  };
}
