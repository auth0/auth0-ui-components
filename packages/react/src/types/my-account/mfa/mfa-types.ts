import type {
  CreateAuthenticationMethodResponseContent,
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';

import type { ENROLL, CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';

export interface UserMFAMgmtClasses {
  'UserMFAMgmt-card'?: string;
  'UserMFASetupForm-dialogContent'?: string;
  'DeleteFactorConfirmation-dialogContent'?: string;
}

export interface UserMFAMgmtProps
  extends SharedComponentProps<
    MFAMessages,
    UserMFAMgmtClasses,
    { email?: RegExp; phone?: RegExp }
  > {
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
}

export interface ContactInputFormProps
  extends SharedComponentProps<
    MFAMessages,
    UserMFAMgmtClasses,
    { email?: RegExp; phone?: RegExp }
  > {
  factorType: MFAType;
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
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
  authSession: string;
  authenticationMethodId: string;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
  contact?: string;
  recoveryCode?: string;
  onBack?: () => void;
}

export interface QRCodeEnrollmentFormProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  factorType: MFAType;
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
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
  enrollMfa: (
    factorType: MFAType,
    options: Record<string, string>,
  ) => Promise<CreateAuthenticationMethodResponseContent>;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
}

export interface ShowRecoveryCodeProps
  extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  recoveryCode: string;
  onSuccess: () => void;
  factorType: MFAType;
  authSession: string;
  authenticationMethodId: string;
  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: { userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError?: (error: Error, stage: typeof CONFIRM) => void;
  onClose?: () => void;
  oobCode?: string;
  userOtp?: string;
  onBack?: () => void;
  loading?: boolean;
}

export interface FactorsListProps extends SharedComponentProps<MFAMessages, UserMFAMgmtClasses> {
  factors: Authenticator[];
  factorType: MFAType;
  readOnly: boolean;
  isEnabledFactor: boolean;
  onDeleteFactor: (factorId: string, factorType: MFAType) => void;
  isDeletingFactor: boolean;
  disableDelete: boolean;
}

/**
 * Result returned by the `useMFA` hook.
 * Provides methods to fetch, enroll, and delete MFA authenticators.
 */
export type UseMFAResult = {
  /**
   * Fetch the list of MFA authenticators grouped by factor type.
   * @param onlyActive - Whether to return only active authenticators.
   * @returns A promise resolving to factors grouped by type.
   */
  fetchFactors: (onlyActive?: boolean) => Promise<unknown>;

  /**
   * Enroll a new MFA factor (e.g., SMS, TOTP, Email).
   * @param factorName - The type of MFA to enroll.
   * @param options - Optional options like phone number or email.
   * @returns A promise resolving to the enrollment response.
   */
  enrollMfa: (
    factorType: MFAType,
    options?: EnrollOptions,
  ) => Promise<CreateAuthenticationMethodResponseContent>;

  /**
   * Delete an enrolled MFA authenticator by its ID.
   * @param authenticatorId - The ID of the authenticator to delete.
   * @returns A promise resolving to a success flag.
   */
  deleteMfa: (authenticatorId: string) => Promise<void>;

  confirmEnrollment: (
    factorType: MFAType,
    authSession: string,
    authenticationMethodId: string,
    options: ConfirmEnrollmentOptions,
  ) => Promise<unknown>;
};
