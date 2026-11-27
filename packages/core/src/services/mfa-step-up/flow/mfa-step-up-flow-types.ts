/**
 * Types for the headless MFA step-up flow.
 * @module mfa-step-up-flow-types
 */
import type { MfaStepUpError, MfaStepUpErrorCode } from '../mfa-step-up-api-error';
import type { MfaApiClient, MfaAuthenticator } from '../mfa-step-up-api-types';

import type { MFA_STEP, OPTIONAL_STEPS } from './mfa-step-up-flow-constants';

export type MfaBuiltInStepPath = (typeof MFA_STEP)[keyof typeof MFA_STEP];
export type MfaOptionalStepPath = (typeof OPTIONAL_STEPS)[number];

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

export type HideRules = Record<string, boolean | MfaFlowCondition | undefined>;

export type MfaStepPath = MfaBuiltInStepPath | (string & {});

export interface MfaCustomStep {
  /** The name of the step. The key of its screen in `screens`. Must not be a built-in step. */
  id: string;
  /** Narrow when the step shows. It never shows where the step it is placed next to does not apply, hidden or not. */
  when?: MfaFlowCondition;
  /** Place the step right before this step: a built-in one, or an added one listed earlier. */
  before?: MfaStepPath;
  /** Place the step right after this step: a built-in one, or an added one listed earlier. */
  after?: MfaStepPath;
}

export interface MfaFlowConfig {
  add?: MfaCustomStep[];
  hide?: { [P in MfaOptionalStepPath]?: boolean | MfaFlowCondition };
  skipListForSingleOption?: boolean;
}

export interface BuiltInStep {
  path: MfaBuiltInStepPath;
  appliesWhen: MfaFlowCondition;
}

export interface AddedStep {
  step: MfaFlowStep;
  before?: string;
  after?: string;
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
  step?: MfaStepPath;
  canBack: boolean;
  canChooseAnotherFactor: boolean;
  canResend: boolean;
  resendAvailableAt?: number;
  reason?: MfaBlockReason | MfaCancelReason;
  failure?: MfaStepUpError;
  round: number;
  options: readonly MfaOption[];
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
