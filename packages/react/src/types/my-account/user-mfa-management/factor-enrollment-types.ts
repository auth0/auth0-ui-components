/**
 * MFA enrollment form types.
 * @module factor-enrollment-types
 */

import type {
  MFAType,
  UserMfaManagementMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';

import type { OtpData } from './user-mfa-management-types';

export type ContactPhase = 'enterContact' | 'enterOtp';
export type QRPhase = 'scan' | 'enter-otp';

/** Props for ContactInputForm component. */
export interface ContactInputFormProps
  extends SharedComponentProps<
    UserMfaManagementMessages,
    Record<string, string | undefined>,
    { email?: RegExp; phone?: RegExp }
  > {
  factorType: MFAType;
  contact: string;
  phase: ContactPhase;
  isEnrolling: boolean;
  isConfirming: boolean;
  onSubmitContact: (options: Record<string, string>) => Promise<boolean>;
  onResendCode?: () => Promise<void>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onClose: () => void;
  onPhaseChange: (phase: ContactPhase) => void;
}

/** Props for OTPVerificationForm component. */
export interface OTPVerificationFormProps extends SharedComponentProps<UserMfaManagementMessages> {
  factorType: MFAType;
  contact?: string;
  isConfirming: boolean;
  isEnrolling?: boolean;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onBack?: () => void;
  onResend?: () => Promise<void>;
}

/** Props for QRCodeEnrollmentForm component. */
export interface QRCodeEnrollmentFormProps extends SharedComponentProps<UserMfaManagementMessages> {
  factorType: MFAType;
  otpData: OtpData;
  isEnrolling: boolean;
  isConfirming: boolean;
  phase: QRPhase;
  onContinueQRScan: () => Promise<void>;
  onConfirmOtp: (otpCode: string) => Promise<void>;
  onClose: () => void;
  onPhaseChange: (phase: QRPhase) => void;
}

/** Props for ShowRecoveryCode component. */
export interface ShowRecoveryCodeProps extends SharedComponentProps<UserMfaManagementMessages> {
  recoveryCode: string;
  isLoading: boolean;
  onConfirmRecoveryCode: () => Promise<void>;
  onClose: () => void;
}
