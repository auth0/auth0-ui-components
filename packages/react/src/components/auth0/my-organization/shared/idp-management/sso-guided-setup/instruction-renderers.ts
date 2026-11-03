/**
 * Default instruction content renderers.
 * @module instruction-renderers
 * @internal
 */

import { InstructionMarkdown } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-markdown';
import { InstructionTabs } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-tabs';
import type { InstructionRenderers } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renderers for the content types the engine handles itself. Interactive components (copy
 * values, configure connection, attribute mapping, test, provisioning) are added by the guided
 * setup through `renderers`.
 */
export const DEFAULT_INSTRUCTION_RENDERERS: InstructionRenderers = {
  markdown_component: InstructionMarkdown,
  tabs_component: InstructionTabs,
};
