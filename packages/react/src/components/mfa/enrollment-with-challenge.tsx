import React, { useState, useCallback } from 'react';
import { MfaChallengeModal } from './mfa-challenge-modal';
import { EnrollmentForm } from './enrollment-form';
import { useMFA } from '../../hooks/use-mfa';
import type { MFAType, EnrollOptions } from '@auth0-web-ui-components/core';

// Temporary types until exported from core
interface MfaChallenge {
  type: 'mfa_required' | 'step_up_authentication';
  challengeToken: string;
  availableMethods: Array<{
    type: string;
    authenticatorId: string;
    name: string;
    preferred?: boolean;
  }>;
  message?: string;
}

interface EnrollmentWithChallengeProps {
  /** Whether the enrollment dialog is open */
  open: boolean;
  /** The MFA factor type to enroll */
  factorType: MFAType;
  /** Called when enrollment dialog should close */
  onClose: () => void;
  /** Called when enrollment is successful */
  onSuccess: () => void;
  /** Called when there's an error */
  onError: (error: Error, stage: string) => void;
  /** Localization overrides */
  localization?: Record<string, string>;
}

/**
 * Enhanced enrollment component that handles MFA challenges.
 * This component orchestrates the entire enrollment flow including challenge resolution.
 */
export function EnrollmentWithChallenge({
  open,
  factorType,
  onClose,
  onSuccess,
  onError,
  localization = {},
}: EnrollmentWithChallengeProps): React.JSX.Element {
  const { enrollMfaWithChallenge, resolveChallenge, confirmEnrollment } = useMFA();

  const [showChallenge, setShowChallenge] = useState(false);
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [elevatedToken, setElevatedToken] = useState<string | null>(null);

  /**
   * Enhanced enrollment function that handles challenges
   */
  const handleEnrollWithChallenge = useCallback(
    async (factorName: MFAType, options: EnrollOptions = {}) => {
      const result = await enrollMfaWithChallenge(factorName, options);

      if (result.challenge) {
        // A challenge is required - show the challenge modal
        setChallenge(result.challenge);
        setShowChallenge(true);
        return null; // Return null to indicate challenge is required
      }

      // No challenge required - return the regular enrollment response
      return result;
    },
    [enrollMfaWithChallenge],
  );

  /**
   * Handle successful challenge resolution
   */
  const handleChallengeSuccess = useCallback((accessToken: string) => {
    setElevatedToken(accessToken);
    setShowChallenge(false);
    setChallenge(null);
    // Note: In a real implementation, you might want to automatically retry
    // the enrollment with the elevated token, or let the user try again
  }, []);

  /**
   * Handle challenge resolution error
   */
  const handleChallengeError = useCallback(
    (error: Error) => {
      setShowChallenge(false);
      setChallenge(null);
      onError(error, 'challenge');
    },
    [onError],
  );

  /**
   * Handle challenge modal close
   */
  const handleChallengeClose = useCallback(() => {
    setShowChallenge(false);
    setChallenge(null);
  }, []);

  return (
    <>
      <EnrollmentForm
        open={open && !showChallenge}
        onClose={onClose}
        factorType={factorType}
        enrollMfa={handleEnrollWithChallenge}
        confirmEnrollment={confirmEnrollment}
        onSuccess={onSuccess}
        onError={onError}
      />

      {challenge && (
        <MfaChallengeModal
          open={showChallenge}
          challenge={challenge}
          onResolveChallenge={resolveChallenge}
          onSuccess={handleChallengeSuccess}
          onError={handleChallengeError}
          onClose={handleChallengeClose}
          localization={localization}
        />
      )}

      {elevatedToken && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg">
          <p className="text-sm">
            ✅ Challenge resolved! You can now retry enrollment with elevated permissions.
          </p>
          <button onClick={() => setElevatedToken(null)} className="text-xs underline mt-1">
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
