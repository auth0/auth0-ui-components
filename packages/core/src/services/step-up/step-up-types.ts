import type { ChallengeType } from '../../auth/auth-types';

export interface MfaRequirements {
  /** Required enrollment types (user needs to enroll new authenticator) */
  enroll?: Array<{ type: string }>;
  /** Available challenge types (existing authenticators) */
  challenge?: Array<{ type: ChallengeType }>;
}

export interface MfaRequiredError extends Error {
  error: 'mfa_required';
  error_description: string;
  mfa_token: string;
  mfa_requirements?: MfaRequirements;
}
