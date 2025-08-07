import type {
  EnrollMfaResponse,
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAMessages,
  Styling,
} from '@auth0-web-ui-components/core';

export interface UserMFAMgmtProps {
  customMessages?: Partial<MFAMessages>;
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  disableEnroll?: boolean;
  disableDelete?: boolean;
  readOnly?: boolean;
  factorConfig?: {
    [key in MFAType]?: {
      visible?: boolean;
      enabled?: boolean;
    };
  };
  onEnroll?: () => void;
  onDelete?: () => void;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'enroll' | 'delete' | 'confirm') => void;
  onBeforeAction?: (
    action: 'enroll' | 'delete' | 'confirm',
    factorType: MFAType,
  ) => boolean | Promise<boolean>;
  schemaValidation?: { email?: RegExp; phone?: RegExp };
  styling?: Styling;
}

/**
 * Result returned by the `useMFA` hook.
 * Provides methods to fetch, enroll, and delete MFA authenticators.
 */
export type UseMFAResult = {
  /**
   * Fetch the list of MFA authenticators.
   * @param onlyActive - Whether to return only active authenticators.
   * @returns A promise resolving to array of authenticators.
   */
  fetchFactors: (onlyActive?: boolean) => Promise<Authenticator[]>;

  /**
   * Enroll a new MFA factor (e.g., SMS, TOTP, Email).
   * @param factorName - The type of MFA to enroll.
   * @param options - Optional options like phone number or email.
   * @returns A promise resolving to the enrollment response.
   */
  enrollMfa: (factorName: MFAType, options?: EnrollOptions) => Promise<EnrollMfaResponse>;

  /**
   * Delete an enrolled MFA authenticator by its ID.
   * @param authenticatorId - The ID of the authenticator to delete.
   * @returns A promise resolving to a success flag.
   */
  deleteMfa: (authenticatorId: string) => Promise<void>;

  /**
   * Confirm MFA enrollment with OOB code and user OTP code.
   * @param factorName The MFA factor type.
   * @param options The confirmation codes required to verify enrollment.
   */
  confirmEnrollment: (factorName: MFAType, options: ConfirmEnrollmentOptions) => Promise<unknown>;
};
