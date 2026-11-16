/**
 * Google Workspace directory provisioning constants.
 * @module google-workspace-provisioning-constants
 * @internal
 */

/** Google consent flow polling limits. `VERIFY_INTERVAL_MS` is the API minimum. */
export const GOOGLE_WORKSPACE_CONSENT_TIMING = {
  VERIFY_INTERVAL_MS: 5_000,
  MAX_POLL_MS: 10 * 60_000,
  MAX_POLL_ATTEMPTS: 120,
} as const;
