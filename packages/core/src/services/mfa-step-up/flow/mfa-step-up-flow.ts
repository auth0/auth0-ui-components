/**
 * The default MFA step-up flow, and how `hide` and `add` change it.
 *
 * A flow is an ordered list of steps. Each step knows when it applies: the QR step, for example,
 * applies when the user enrolls OTP or push. After a step the machine shows the next step in the
 * list that is visible, so hiding a step skips it. Added steps run last.
 * @module mfa-step-up-flow
 */
import { FACTOR_TYPE_OTP, FACTOR_TYPE_PUSH } from '../mfa-step-up-api-constants';
import { requiresContactInput } from '../mfa-step-up-api-utils';

import type {
  MfaCustomStep,
  MfaFlowCondition,
  MfaFlowConfig,
  MfaFlowStep,
} from './mfa-step-up-flow-types';

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

export type MfaBuiltInStepPath = (typeof MFA_STEP)[keyof typeof MFA_STEP];
export type MfaOptionalStepPath = (typeof OPTIONAL_STEPS)[number];

const OPTIONAL_PATHS: readonly string[] = OPTIONAL_STEPS;
const BUILT_IN_PATHS: readonly string[] = Object.values(MFA_STEP);

const flowError = (message: string) => new Error(`MFA flow: ${message}`);

// Only optional steps can be hidden; the others are needed for the flow to work.
const assertOptionalSteps = (paths: readonly string[]) => {
  const requiredPath = paths.find((path) => !OPTIONAL_PATHS.includes(path));
  if (requiredPath) throw flowError(`"${requiredPath}" cannot be hidden`);
};

// Every added step needs an id that no other step uses.
const assertUniqueIds = (add: MfaCustomStep[]) => {
  const usedIds = new Set(BUILT_IN_PATHS);
  for (const { id } of add) {
    if (!id) throw flowError('an added step needs an id');
    if (usedIds.has(id)) throw flowError(`duplicate step id "${id}"`);
    usedIds.add(id);
  }
};

interface FlowConfigToCheck {
  add: MfaCustomStep[];
  hide: Record<string, unknown>;
}

/**
 * @param config - What the integrator asked for, with `add` and `hide` both present.
 * @throws When a step cannot be hidden, or an added step has no id or a repeated one.
 */
export function assertValidFlowConfig(config: FlowConfigToCheck): void {
  const hiddenPaths = Object.entries(config.hide)
    .filter(([, rule]) => rule !== false && rule !== undefined)
    .map(([path]) => path);
  assertOptionalSteps(hiddenPaths);
  assertUniqueIds(config.add);
}

const whenEnrolling =
  (appliesWhen: MfaFlowCondition): MfaFlowCondition =>
  (facts) =>
    facts.mode === 'enroll' && appliesWhen(facts);

// In the order the user goes through them.
const BUILT_IN_STEPS: Array<{ path: MfaBuiltInStepPath; appliesWhen: MfaFlowCondition }> = [
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

const toHiddenWhen = (hide: boolean | MfaFlowCondition | undefined): MfaFlowCondition =>
  typeof hide === 'function' ? hide : () => hide === true;

/**
 * Builds the ordered list of steps from the default flow and the configuration.
 *
 * @param config - `hide`, `add` and `skipListForSingleOption`.
 * @returns The steps in order.
 * @throws When the configuration is invalid.
 */
export function createMfaFlow({
  add = [],
  hide = {},
  skipListForSingleOption = false,
}: MfaFlowConfig = {}): MfaFlowStep[] {
  assertValidFlowConfig({ add, hide });

  const hideRules: Partial<Record<string, boolean | MfaFlowCondition>> = hide;

  const isHiddenWhen = (path: MfaBuiltInStepPath): MfaFlowCondition =>
    path === MFA_STEP.list
      ? (facts) => skipListForSingleOption && facts.optionCount === 1
      : toHiddenWhen(hideRules[path]);

  const builtInSteps = BUILT_IN_STEPS.map(({ path, appliesWhen }): MfaFlowStep => {
    const isHidden = isHiddenWhen(path);
    return { path, isVisible: (facts) => appliesWhen(facts) && !isHidden(facts) };
  });

  // An added step runs once the user has picked an option.
  const addedSteps = add.map(
    ({ id, when = () => true }): MfaFlowStep => ({
      path: id,
      isVisible: (facts) => facts.mode !== undefined && when(facts),
    }),
  );

  return [...builtInSteps, ...addedSteps];
}
