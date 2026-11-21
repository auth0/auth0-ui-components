/**
 * My Organization configuration constants.
 * @module config-constants
 * @internal
 */

import type {
  ExitConditionPolicy,
  InstructionsExitCondition,
} from './instructions/instructions-types';

export const PROVISIONING_METHODS = {
  SCIM: 'scim',
  GOOGLE_WORKSPACE: 'google_workspace',
} as const;

export const EXIT_CONDITION_POLICY: Record<InstructionsExitCondition, ExitConditionPolicy> = {
  connection_exists: 'blocking',
  connection_testing_suggested: 'suggested',
  token_generation_suggested: 'suggested',
  google_workspace_setup_complete: 'blocking',
};
