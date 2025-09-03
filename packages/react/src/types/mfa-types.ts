import type {
  EnrollMfaResponse,
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAMessages,
  SharedComponentProps,
} from '@auth0-web-ui-components/core';
import { ENROLL, CONFIRM } from '@/lib/mfa-constants';

export interface UserMFAMgmtClasses {
  'UserMFAMgmt-card'?: string;
  'UserMFASetupForm-dialogContent'?: string;
  'DeleteFactorConfirmation-dialogContent'?: string;
}

export interface UserMFAMgmtProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
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
}

export interface ContactInputFormProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  schemaValidation?: { email?: RegExp; phone?: RegExp };
}

export interface DeleteFactorConfirmationProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorToDelete: {
    id: string;
    type: MFAType;
  } | null;
  isDeletingFactor: boolean;
  onConfirm: (factorId: string) => void;
  onCancel: () => void;
}

export interface OTPVerificationFormProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  factorType: MFAType;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
  contact?: string;
  onBack?: () => void;
}

export interface QRCodeEnrollmentFormProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
}

export interface UserMFASetupFormProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  schemaValidation?: { email?: RegExp; phone?: RegExp };
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
