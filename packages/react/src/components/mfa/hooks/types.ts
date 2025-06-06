import type {
  EnrollMfaParams,
  EnrollMfaResponse,
  AuthenticatorType,
  OobChannel,
} from '@auth0-web-ui-components/core';
/**
 * Metadata describing an MFA factor type.
 * @property {string} title - Display title of the factor.
 * @property {string} description - Description of the factor.
 */
export interface FactorMeta {
  title: string;
  description: string;
}

/**
 * Represents an MFA authenticator linked to a user.
 * @property {string} id - Unique identifier of the authenticator.
 * @property {string} authenticator_type - Type of the authenticator.
 * @property {string[]} [oob_channels] - Optional out-of-band channels supported.
 * @property {string} [name] - Optional name of the authenticator.
 * @property {boolean} active - Whether the authenticator is active.
 */
export interface Authenticator extends FactorMeta {
  id: string;
  authenticator_type: AuthenticatorType;
  oob_channels?: OobChannel[];
  name?: string;
  active: boolean;
}

/**
 * Result returned by the `useMfaList` hook.
 * @property {boolean} loading - Indicates if the fetch request is in progress.
 * @property {Error | null} error - Error encountered during fetching, or null.
 * @property {(Authenticator & FactorMeta)[]} factors - List of authenticators enriched with metadata.
 */
export interface UseMfaListResult {
  loading: boolean;
  error: Error | null;
  factors: (Authenticator & FactorMeta)[];
}

/**
 * Result returned by the `useDeleteMfa` hook.
 * @property {boolean} loading - Indicates if the delete operation is in progress.
 * @property {Error} [error] - Error encountered during deletion, if any.
 * @property {boolean} success - Indicates if the deletion was successful.
 */
export interface DeleteMfaResult {
  loading: boolean;
  error?: Error;
  success: boolean;
}

/**
 * Result object returned by the `useEnrollMfa` hook.
 *
 * @property {boolean} loading - True if enrollment request is in progress.
 * @property {Error | null} error - Error encountered during enrollment, if any.
 * @property {EnrollMfaResponse | null} response - Response data from enrollment endpoint.
 * @property {(params: EnrollMfaParams, mfaToken?: string) => Promise<void>} enrollMfa - Function to initiate MFA enrollment.
 */
export interface UseEnrollMfaResult {
  loading: boolean;
  error: Error | null;
  response: EnrollMfaResponse | null;
  enrollMfa: (params: EnrollMfaParams, mfaToken?: string) => Promise<void>;
}

/**
 * Parameters required to verify an MFA recovery code.
 *
 * @property {string} mfaToken - The MFA token received from the `mfa_required` error.
 * @property {string} recoveryCode - The recovery code provided by the user.
 */
export interface VerifyMfaRecoveryCodeParams {
  mfaToken: string;
  recoveryCode: string;
}

/**
 * Result returned by the `useVerifyMfaRecoveryCode` hook.
 *
 * @property {boolean} loading - Indicates whether the verification request is in progress.
 * @property {Error | null} error - Contains any error that occurred during verification, or null if none.
 * @property {any | null} data - The token response from Auth0 if the recovery code was successfully verified.
 * @property {(params: VerifyMfaRecoveryCodeParams) => Promise<void>} verifyRecoveryCode - Function to initiate the recovery code verification.
 */
export interface VerifyMfaRecoveryCodeResult {
  loading: boolean;
  error: Error | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | null; // Contains the access_token, id_token, etc. from the response
  verifyRecoveryCode: (params: VerifyMfaRecoveryCodeParams) => Promise<void>;
}
