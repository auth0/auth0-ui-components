/**
 * Instructions flow constants.
 * @module instructions-constants
 * @internal
 */

import type { ExitConditionPolicy, InstructionsExitCondition } from './instructions-types';

export const EXIT_CONDITION_POLICY: Record<InstructionsExitCondition, ExitConditionPolicy> = {
  connection_exists: 'blocking',
  connection_testing_suggested: 'suggested',
  token_generation_suggested: 'suggested',
  google_workspace_setup_complete: 'blocking',
};
