/**
 * MFA management types.
 * @module user-mfa-management-types
 */

import type {
  CreateAuthenticationMethodResponseContent,
  VerifyAuthenticationMethodResponseContent,
  Authenticator,
  ComponentAction,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  UserMfaManagementMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export type EnrollmentPhase = 'enterContact' | 'showQr' | 'showRecovery' | 'installation' | null;

export type OtpData = { barcodeUri: string; manualInputCode: string };
export type FactorToDelete = { id: string; type: MFAType };

/** Configuration for an individual MFA factor type. */
export interface FactorConfigOptions {
  visible?: boolean;
  enabled?: boolean;
}

/** MFA factor type configuration map. */
export type FactorConfig = { [K in MFAType]?: FactorConfigOptions };

/** CSS classes for UserMFAManagement component. */
export interface UserMFAManagementClasses {
  'UserMFAManagement-item'?: string;
  'EnrollFactorModal-dialogContent'?: string;
  'FactorDeleteModal-dialogContent'?: string;
}

/** Props for UserMFAManagement component. */
export interface UserMFAManagementProps
  extends SharedComponentProps<
    UserMfaManagementMessages,
    UserMFAManagementClasses,
    { email?: RegExp; phone?: RegExp }
  > {
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  disableEnroll?: boolean;
  disableDelete?: boolean;
  readOnly?: boolean;
  factorConfig?: FactorConfig;
  enrollAction?: ComponentAction<MFAType>;
  deleteAction?: ComponentAction<MFAType>;
}

/** Props for UserMFAManagementView component. */
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
  otpData: OtpData;
  recoveryCode: string;
  isDeleteDialogOpen: boolean;
  factorToDelete: FactorToDelete | null;
  factorsByType: Record<MFAType, Authenticator[]>;
  visibleFactorTypes: MFAType[];
  hasNoActiveFactors: boolean;
  onEnrollFactor: (factor: MFAType) => void;
  onDeleteFactor: (factorId: string, factorType: MFAType) => Promise<void>;
  onCloseEnrollDialog: () => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
  onSubmitContact: (options: Record<string, string>) => Promise<boolean>;
  onResendCode?: () => Promise<void>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onContinueQRScan: () => Promise<void>;
  onConfirmRecoveryCode: () => Promise<void>;
  onStartQREnrollment: () => Promise<void>;
}

/** Options for useUserMFA hook. */
export interface UseUserMFAOptions {
  showActiveOnly?: UserMFAManagementProps['showActiveOnly'];
  readOnly?: UserMFAManagementProps['readOnly'];
  disableDelete?: UserMFAManagementProps['disableDelete'];
  factorConfig?: UserMFAManagementProps['factorConfig'];
  customMessages?: UserMFAManagementProps['customMessages'];
  enrollAction?: UserMFAManagementProps['enrollAction'];
  deleteAction?: UserMFAManagementProps['deleteAction'];
}

/** Return type of useUserMFA hook. */
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
  factorToDelete: FactorToDelete | null;
  visibleFactorTypes: MFAType[];
  hasNoActiveFactors: boolean;
  contact: string;
  otpData: OtpData;
  recoveryCode: string;
  handleCancelDelete: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleEnroll: (factor: MFAType) => Promise<void>;
  handleCloseEnrollDialog: () => Promise<void>;
  handleDeleteFactor: (factorId: string, factorType: MFAType) => Promise<void>;
  handleSendCode: (options: Record<string, string>) => Promise<boolean>;
  handleResendCode?: () => Promise<void>;
  handleConfirmOtp: (otpCode: string) => Promise<void>;
  handleConfirmPush: () => Promise<void>;
  handleConfirmRecoveryCode: () => Promise<void>;
  handleEnterQRPhase: () => Promise<void>;
}

/** Return type of useUserMFAService hook. */
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
