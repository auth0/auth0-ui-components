/**
 * MFA management types.
 * @module mfa-types
 */

import type {
  CreateAuthenticationMethodResponseContent,
  VerifyAuthenticationMethodResponseContent,
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type {
  ENTER_CONTACT,
  ENTER_QR,
  SHOW_RECOVERY_CODE,
  QR_PHASE_INSTALLATION,
  QR_PHASE_SCAN,
  QR_PHASE_ENTER_OTP,
} from '@/lib/constants/my-account/mfa/mfa-constants';

export type EnrollmentPhase =
  | typeof ENTER_CONTACT
  | typeof ENTER_QR
  | typeof SHOW_RECOVERY_CODE
  | typeof QR_PHASE_INSTALLATION
  | typeof QR_PHASE_SCAN
  | typeof QR_PHASE_ENTER_OTP
  | null;

export interface UserMFAOptions {
  showActiveOnly?: boolean;
  readOnly?: boolean;
  disableDelete?: boolean;
  factorConfig?: FactorConfig;
  customMessages?: UserMFAManagementProps['customMessages'];
  onFetch?: () => void;
  onEnroll?: () => void;
  onDelete?: () => void;
  onErrorAction?: (error: Error, action: 'enroll' | 'delete' | 'confirm') => void;
  onBeforeAction?: (
    action: 'enroll' | 'delete' | 'confirm',
    factorType: MFAType,
  ) => boolean | Promise<boolean>;
}

export interface UseUserMFAReturn {
  factorsByType: Record<MFAType, Authenticator[]>;
  isLoadingFactors: boolean;
  isEnrolling: boolean;
  isDeleting: boolean;
  isConfirming: boolean;
  error: string | null;
  isEnrollDialogOpen: boolean;
  enrollFactor: MFAType | null;
  enrollmentPhase: EnrollmentPhase;
  isDeleteDialogOpen: boolean;
  factorToDelete: { id: string; type: MFAType } | null;
  visibleFactorTypes: MFAType[];
  hasNoActiveFactors: boolean;
  contact: string;
  otpData: { barcodeUri: string; manualInputCode: string };
  recoveryCode: string;
  handleCancelDelete: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleEnroll: (factor: MFAType) => Promise<void>;
  handleCloseEnrollDialog: () => Promise<void>;
  handleDeleteFactor: (factorId: string, factorType: MFAType) => Promise<void>;
  handleSendCode: (options: Record<string, string>) => Promise<boolean>;
  handleConfirmOtp: (otpCode: string) => Promise<void>;
  handleConfirmPush: () => Promise<void>;
  handleConfirmRecoveryCode: () => Promise<void>;
  handleEnterQRPhase: () => Promise<void>;
}

export interface UseUserMFAServiceReturn {
  factorsQuery: UseQueryResult<Record<MFAType, Authenticator[]>>;
  enrollMutation: UseMutationResult<
    CreateAuthenticationMethodResponseContent,
    Error,
    { factorType: MFAType; options?: EnrollOptions }
  >;
  deleteMutation: UseMutationResult<void, Error, string>;
  verifyMutation: UseMutationResult<
    VerifyAuthenticationMethodResponseContent,
    Error,
    {
      factorType: MFAType;
      authSession: string;
      authenticationMethodId: string;
      options: ConfirmEnrollmentOptions;
    }
  >;
}

/** Configuration for an individual MFA factor type. */
export interface FactorConfigOptions {
  visible?: boolean;
  enabled?: boolean;
}

/** MFA factor type configuration map. */
export type FactorConfig = Partial<Record<MFAType, FactorConfigOptions>>;

/** CSS classes for UserMFAManagement component. */
export interface UserMFAManagementClasses {
  'UserMFAManagement-card'?: string;
  'UserMFASetupForm-dialogContent'?: string;
  'DeleteFactorConfirmation-dialogContent'?: string;
}

/** Props for UserMFAManagement component. */
export interface UserMFAManagementProps
  extends SharedComponentProps<
    MFAMessages,
    UserMFAManagementClasses,
    { email?: RegExp; phone?: RegExp }
  > {
  /** Hide component header. */
  hideHeader?: boolean;

  /** Show only active (enrolled) factors. */
  showActiveOnly?: boolean;

  /** Disable enrolling new factors. */
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
    UserMFAManagementClasses,
    { email?: RegExp; phone?: RegExp }
  > {
  factorType: MFAType;
  contact: string;
  isEnrolling: boolean;
  isConfirming: boolean;
  onSubmitContact: (options: Record<string, string>) => Promise<boolean>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onClose: () => void;
}

export interface DeleteFactorConfirmationProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorToDelete: {
    id: string;
    type: MFAType;
  } | null;
  isDeletingFactor: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface OTPVerificationFormProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  factorType: MFAType;
  contact?: string;
  isConfirming: boolean;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onBack?: () => void;
}

export interface QRCodeEnrollmentFormProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  factorType: MFAType;
  barcodeUri: string;
  manualInputCode: string;
  isEnrolling: boolean;
  isConfirming: boolean;
  onContinueQR: () => Promise<void>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onClose: () => void;
}

export interface UserMFASetupFormProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollmentPhase: EnrollmentPhase;
  contact: string;
  otpData: { barcodeUri: string; manualInputCode: string };
  recoveryCode: string;
  isEnrolling: boolean;
  isConfirming: boolean;
  onSubmitContact: (options: Record<string, string>) => Promise<boolean>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onContinueQR: () => Promise<void>;
  onConfirmRecoveryCode: () => Promise<void>;
  onAdvanceToQR: () => void;
}

export interface ShowRecoveryCodeProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  recoveryCode: string;
  isEnrolling: boolean;
  isConfirming: boolean;
  onConfirmRecoveryCode: () => Promise<void>;
  onClose: () => void;
}

export interface FactorsListProps
  extends SharedComponentProps<MFAMessages, UserMFAManagementClasses> {
  factors: Authenticator[];
  factorType: MFAType;
  readOnly: boolean;
  isEnabledFactor: boolean;
  onDeleteFactor: (factorId: string, factorType: MFAType) => void;
  isDeletingFactor: boolean;
  disableDelete: boolean;
}

export interface UserMFAManagementViewProps {
  error: string | null;
  schema: UserMFAManagementProps['schema'];
  isEnrolling: boolean;
  isDeleting: boolean;
  isConfirming: boolean;
  styling: UserMFAManagementProps['styling'];
  customMessages: UserMFAManagementProps['customMessages'];
  hideHeader: boolean;
  showActiveOnly: boolean;
  disableEnroll: boolean;
  disableDelete: boolean;
  readOnly: boolean;
  factorConfig?: FactorConfig;
  isEnrollDialogOpen: boolean;
  enrollFactor: MFAType | null;
  enrollmentPhase: EnrollmentPhase;
  contact: string;
  otpData: { barcodeUri: string; manualInputCode: string };
  recoveryCode: string;
  isDeleteDialogOpen: boolean;
  factorToDelete: { id: string; type: MFAType } | null;
  factorsByType: Record<MFAType, Authenticator[]>;
  visibleFactorTypes: MFAType[];
  hasNoActiveFactors: boolean;
  onEnrollFactor: (factor: MFAType) => void;
  onDeleteFactor: (factorId: string, factorType: MFAType) => Promise<void>;
  onCloseEnrollDialog: () => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
  onSubmitContact: (options: Record<string, string>) => Promise<boolean>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onContinueQR: () => Promise<void>;
  onConfirmRecoveryCode: () => Promise<void>;
  onAdvanceToQR: () => void;
}
