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
import type * as React from 'react';

import type { ActionPartProps } from '@/types/composability-types';

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

/** State and command of one action, shared by action parts and headless hosts. */
export interface MFAActionModel {
  /** The action is not offered and its part renders nothing. */
  hidden: boolean;
  /** The action is shown but cannot be triggered. */
  disabled: boolean;
  /** The action's command is running. */
  pending: boolean;
  /** Runs the action. Does nothing while hidden, disabled or pending. */
  onClick: () => void;
}

/** One factor type, as rendered by `UserMFAManagement.Factor`. */
export interface MFAFactorModel {
  factorType: MFAType;
  /** Enrolled authenticators of this type. */
  activeFactors: Authenticator[];
  hasActiveFactors: boolean;
  /** `false` when `factorConfig[factorType].enabled` is `false`. */
  isEnabled: boolean;
  enrollAction: MFAActionModel;
}

/** One enrolled authenticator, as rendered inside `UserMFAManagement.FactorList`. */
export interface MFAEnrolledFactorModel {
  factor: Authenticator;
  factorType: MFAType;
  deleteAction: MFAActionModel;
}

/** Value read by `useUserMFAEnrolledFactorContext` inside `UserMFAManagement.FactorList`. */
export interface UserMFAEnrolledFactorContextValue extends MFAEnrolledFactorModel {
  /** Display label, such as the phone number, the email or the factor title. */
  label: string;
  /**
   * Id of the element showing `label`. `UserMFAManagement.EnrolledFactorName` sets it,
   * and `DeleteAction` is described by it. Put it on your own name element if you do not
   * render `EnrolledFactorName`.
   */
  labelId: string;
}

/** Options for `useUserMFAModel`. */
export interface UseUserMFAModelOptions extends UseUserMFAOptions {
  disableEnroll?: UserMFAManagementProps['disableEnroll'];
}

/**
 * Headless model for MFA management.
 *
 * A host that renders its own UI must honour `hidden`/`disabled`/`pending` on each
 * action, render the enroll flow from `isEnrollDialogOpen` / `enrollmentPhase`, and
 * render a confirmation from `isDeleteDialogOpen` / `factorToDelete` before calling
 * `handleConfirmDelete`.
 */
export interface UserMFAModel extends UseUserMFAReturn {
  readOnly: boolean;
  disableEnroll: boolean;
  disableDelete: boolean;
  showActiveOnly: boolean;
  factorConfig: FactorConfig;
  /** Props for one factor type. */
  getFactorProps: (factorType: MFAType) => MFAFactorModel;
  /** Props for one enrolled authenticator. */
  getEnrolledFactorProps: (factor: Authenticator, factorType: MFAType) => MFAEnrolledFactorModel;
}

/** Value read by every `UserMFAManagement` part. */
export interface UserMFAManagementContextValue {
  model: UserMFAModel;
  customMessages: NonNullable<UserMFAManagementProps['customMessages']>;
  styling: NonNullable<UserMFAManagementProps['styling']>;
  classes: UserMFAManagementClasses;
  hideHeader: boolean;
}

/** Props for `UserMFAManagement.Root`. */
export interface UserMFAManagementRootProps extends UserMFAManagementProps {
  children?: React.ReactNode;
}

/** Props for `UserMFAManagement.DefaultLayout`. */
export interface UserMFAManagementDefaultLayoutProps {
  /**
   * Replaces the enroll action of every factor, e.g. an `EnrollAction` with `render`.
   * It is rendered inside each `Factor`, so it acts on that factor.
   */
  enrollAction?: React.ReactNode;
  /** Replaces the default factor card. */
  renderFactor?: (factorType: MFAType) => React.ReactNode;
}

/** Props for `UserMFAManagement.Factors`. */
export interface UserMFAManagementFactorsProps {
  /** Renders each visible factor type. Defaults to `<UserMFAManagement.Factor />`. */
  children?: (factorType: MFAType) => React.ReactNode;
  className?: string;
}

/** Props for `UserMFAManagement.FactorList`. */
export interface UserMFAManagementFactorListProps {
  /** Renders each enrolled authenticator. Defaults to the built-in list with a menu. */
  children?: (factor: Authenticator) => React.ReactNode;
  className?: string;
}

/** Props for parts that only take content and a class name. */
export interface UserMFAManagementPartProps {
  children?: React.ReactNode;
  className?: string;
}

/** Props for `UserMFAManagement.Header`. */
export interface UserMFAManagementHeaderProps extends UserMFAManagementPartProps {
  /** Text alignment of the default title and description. */
  align?: 'start' | 'center' | 'end';
}

/** Props for `UserMFAManagement.HeaderActions`. */
export interface UserMFAManagementHeaderActionsProps extends UserMFAManagementPartProps {
  /** Side the actions sit on from the `sm` breakpoint up. */
  align?: 'start' | 'end';
}

/** Props for `UserMFAManagement.EnrollAction` and `UserMFAManagement.DeleteAction`. */
export type UserMFAManagementActionProps = ActionPartProps;

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
