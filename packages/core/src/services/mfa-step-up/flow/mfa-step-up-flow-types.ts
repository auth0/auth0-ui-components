/**
 * Types for the headless MFA step-up flow.
 * @module mfa-step-up-flow-types
 */
import type { MfaApiClient, MfaAuthenticator } from '../mfa-step-up-api-types';
import type { MfaStepUpError, MfaStepUpErrorCode } from '../mfa-step-up-errors';

import type { MfaBuiltInStepPath, MfaOptionalStepPath } from './mfa-step-up-flow';

export type MfaFlowStatus = 'loading' | 'active' | 'done' | 'blocked' | 'cancelled';

export type MfaBlockReason = Exclude<MfaStepUpErrorCode, 'cancelled'>;

export type MfaCancelReason = 'user' | 'disposed';

export interface MfaFlowFacts {
  mode?: 'enroll' | 'challenge';
  factor?: string;
  optionCount: number;
  enrollment: { hasRecoveryCodes: boolean };
  isVerified: boolean;
  round: number;
  hasNewRecoveryCode: boolean;
}

export type MfaFlowCondition = (facts: MfaFlowFacts) => boolean;

export interface MfaCustomStep {
  id: string;
  when?: MfaFlowCondition;
}

export interface MfaFlowConfig {
  add?: MfaCustomStep[];
  hide?: { [P in MfaOptionalStepPath]?: boolean | MfaFlowCondition };
  skipListForSingleOption?: boolean;
}

export interface MfaFlowStep {
  path: string;
  isVisible: MfaFlowCondition;
}

export interface MfaOption {
  id: string;
  kind: 'enroll' | 'challenge';
  factor: string;
  authenticator?: Pick<
    MfaAuthenticator,
    'id' | 'authenticatorType' | 'type' | 'name' | 'createdAt' | 'lastAuth'
  >;
}

export type MfaRequestName = 'resolveRequirements' | 'enroll' | 'challenge' | 'verify';

export type MfaPushPhase = 'waiting' | 'approved' | 'denied' | 'expired';

export type MfaPushApproval = 'poll' | 'code';

export interface MfaPushView {
  mode: 'push' | 'code';
  phase: MfaPushPhase;
  canApprove: boolean;
}

export interface MfaEnrollmentView {
  authenticatorType?: 'otp' | 'oob';
  barcodeUri?: string;
  secret?: string;
  recoveryCodes?: string[];
}

export interface MfaStepUpSnapshot {
  status: MfaFlowStatus;
  step?: MfaBuiltInStepPath | (string & {});
  canBack: boolean;
  canChooseAnotherFactor: boolean;
  canResend: boolean;
  resendAvailableAt?: number;
  reason?: MfaBlockReason | MfaCancelReason;
  failure?: MfaStepUpError;
  round: number;
  options: MfaOption[];
  selected?: MfaOption;
  facts: MfaFlowFacts;
  request: { name?: MfaRequestName; isLoading: boolean; error?: unknown };
  contact: string;
  enrollment: MfaEnrollmentView;
  push?: MfaPushView;
  newRecoveryCode?: string;
}

export interface MfaStepUpOptions {
  apiClient: MfaApiClient;
  error: unknown;
  isProxyMode?: boolean;
  flow?: MfaFlowConfig;
  onError?: (error: unknown) => void;
  resendCooldownMs?: number;
  pushApproval?: MfaPushApproval;
  pushPollIntervalMs?: number;
  pushTimeoutMs?: number;
  pushApprovedDelayMs?: number;
  now?: () => number;
}

export interface MfaStepUpMachine {
  start(): Promise<void>;
  getSnapshot(): MfaStepUpSnapshot;
  subscribe(listener: () => void): () => void;
  next(input?: string): Promise<void>;
  back(): void;
  chooseAnotherFactor(): void;
  resend(): Promise<void>;
  switchToCode(): void;
  switchToPush(): Promise<void>;
  cancel(): void;
  dispose(): void;
}
