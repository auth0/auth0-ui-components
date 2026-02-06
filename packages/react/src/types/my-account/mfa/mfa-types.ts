import type {
  CreateAuthenticationMethodResponseContent,
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';

import type { ENROLL, CONFIRM } from '../../../lib/mfa-constants';

/**
 * Configuration options for an individual MFA factor type.
 */
export interface FactorConfigOptions {
  /** Whether the factor type should be visible in the UI */
  visible?: boolean;
  /** Whether the factor type can be enrolled/deleted */
  enabled?: boolean;
}

/**
 * Configuration object for MFA factor types.
 * Maps each MFA factor type to its visibility and enabled settings.
 */
export type FactorConfig = Partial<Record<MFAType, FactorConfigOptions>>;

/**
 * CSS class names for customizing the UserMFAMgmt component styling.
 *
 * @example
 * ```tsx
 * const classes: UserMFAMgmtClasses = {
 *   'UserMFAMgmt-card': 'my-custom-card-class',
 *   'UserMFASetupForm-dialogContent': 'my-dialog-class',
 * };
 * ```
 */
export interface UserMFAMgmtClasses {
  /** Custom class for the main MFA management card container */
  'UserMFAMgmt-card'?: string;
  /** Custom class for the MFA setup form dialog content */
  'UserMFASetupForm-dialogContent'?: string;
  /** Custom class for the delete confirmation dialog content */
  'DeleteFactorConfirmation-dialogContent'?: string;
}

/**
 * Props for the UserMFAMgmt component.
 *
 * @see {@link UserMFAMgmt} for component usage and examples
 * @see {@link UserMFAMgmtClasses} for available CSS class customizations
 */
export interface UserMFAMgmtProps
  extends SharedComponentProps<
    MFAMessages,
    UserMFAMgmtClasses,
    { email?: RegExp; phone?: RegExp }
  > {
  /**
   * Whether to hide the component header.
   * @defaultValue `false`
   */
  hideHeader?: boolean;

  /**
   * Whether to show only active (enrolled) MFA factors.
   * When `true`, only factors that are currently enrolled will be displayed.
   * @defaultValue `false`
   */
  showActiveOnly?: boolean;

  /**
   * Whether to disable the ability to enroll new MFA factors.
   * @defaultValue `false`
   */
  disableEnroll?: boolean;

  /**
   * Whether to disable the ability to delete existing MFA factors.
   * @defaultValue `false`
   */
  disableDelete?: boolean;

  /**
   * Whether the component should be in read-only mode.
   * When `true`, users cannot enroll or delete factors.
   * @defaultValue `false`
   */
  readOnly?: boolean;

  /**
   * Configuration for individual MFA factor types.
   * Allows hiding or disabling specific factor types.
   *
   * @example
   * ```tsx
   * factorConfig={{
   *   sms: { visible: true, enabled: true },
   *   email: { visible: true, enabled: false },
   *   otp: { visible: false },
   * }}
   * ```
   *
   * @see {@link FactorConfig} for the type definition
   * @see {@link FactorConfigOptions} for available options per factor
   */
  factorConfig?: FactorConfig;

  /**
   * Callback invoked after a factor is successfully enrolled.
   */
  onEnroll?: () => void;

  /**
   * Callback invoked after a factor is successfully deleted.
   */
  onDelete?: () => void;

  /**
   * Callback invoked after factors are successfully fetched.
   */
  onFetch?: () => void;

  /**
   * Callback invoked when an error occurs during an MFA action.
   * @param error - The error that occurred
   * @param action - The action that failed ('enroll', 'delete', or 'confirm')
   */
  onErrorAction?: (error: Error, action: 'enroll' | 'delete' | 'confirm') => void;

  /**
   * Callback invoked before an MFA action is performed.
   * Return `false` or a Promise resolving to `false` to cancel the action.
   *
   * @param action - The action about to be performed ('enroll', 'delete', or 'confirm')
   * @param factorType - The MFA factor type involved in the action
   * @returns `true` to proceed, `false` to cancel
   *
   * @example
   * ```tsx
   * onBeforeAction={async (action, factorType) => {
   *   if (action === 'delete') {
   *     return await confirmDeletion();
   *   }
   *   return true;
   * }}
   * ```
   */
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
   * @param factorType - The type of MFA to enroll.
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
