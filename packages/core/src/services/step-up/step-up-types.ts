export interface MfaRequirements {
  /** Required enrollment types (user needs to enroll new authenticator) */
  enroll?: Array<{ type: string }>;
  /** Available challenge types (existing authenticators) */
  challenge?: Array<{ type: string }>;
}

export interface MfaRequiredError extends Error {
  error: 'mfa_required';
  error_description: string;
  mfa_token: string;
  mfa_requirements?: MfaRequirements;
}
