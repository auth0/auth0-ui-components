import { FACTOR_TYPE_OTP, FACTOR_TYPE_PUSH } from '../mfa-step-up-api-constants';
import { requiresContactInput } from '../mfa-step-up-api-utils';

import type { BuiltInStep, MfaFlowCondition } from './mfa-step-up-flow-types';

/** Paths of the built-in steps. Use these instead of string literals so a typo cannot go unnoticed. */
export const MFA_STEP = {
  list: 'list',
  install: 'enroll.install',
  contact: 'enroll.contact',
  qr: 'enroll.qr',
  verify: 'enroll.verify',
  recovery: 'enroll.recovery',
  confirm: 'challenge.confirm',
  challenge: 'challenge',
  newRecoveryCode: 'challenge.newRecoveryCode',
} as const;

/** The steps an integrator can hide. The others are needed for the flow to work. */
export const OPTIONAL_STEPS = [MFA_STEP.install, MFA_STEP.recovery, MFA_STEP.confirm] as const;

export const OPTIONAL_STEP_PATHS = new Set<string>(OPTIONAL_STEPS);

const whenEnrolling =
  (appliesWhen: MfaFlowCondition): MfaFlowCondition =>
  (facts) =>
    facts.mode === 'enroll' && appliesWhen(facts);

export const BUILT_IN_STEPS: ReadonlyArray<BuiltInStep> = [
  { path: MFA_STEP.list, appliesWhen: () => true },
  {
    path: MFA_STEP.install,
    appliesWhen: whenEnrolling((facts) => facts.factor === FACTOR_TYPE_PUSH),
  },
  {
    path: MFA_STEP.contact,
    appliesWhen: whenEnrolling((facts) => requiresContactInput(facts.factor)),
  },
  {
    path: MFA_STEP.qr,
    appliesWhen: whenEnrolling(
      (facts) => facts.factor === FACTOR_TYPE_OTP || facts.factor === FACTOR_TYPE_PUSH,
    ),
  },
  {
    path: MFA_STEP.verify,
    appliesWhen: whenEnrolling((facts) => facts.factor !== FACTOR_TYPE_PUSH),
  },
  {
    path: MFA_STEP.recovery,
    appliesWhen: whenEnrolling((facts) => facts.enrollment.hasRecoveryCodes),
  },
  { path: MFA_STEP.confirm, appliesWhen: (facts) => facts.mode === 'challenge' },
  { path: MFA_STEP.challenge, appliesWhen: (facts) => facts.mode === 'challenge' },
  {
    path: MFA_STEP.newRecoveryCode,
    appliesWhen: (facts) => facts.mode === 'challenge' && facts.hasNewRecoveryCode,
  },
];

export const hasPickedOption: MfaFlowCondition = (facts) => facts.mode !== undefined;

export const flowError = (message: string) => new Error(`MFA flow: ${message}`);
