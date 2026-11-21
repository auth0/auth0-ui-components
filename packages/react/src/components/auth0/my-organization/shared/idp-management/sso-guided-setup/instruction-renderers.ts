/**
 * Default instruction content renderers.
 * @module instruction-renderers
 * @internal
 */

import {
  InstructionAttributeMapping,
  InstructionConfigureConnection,
  InstructionGoogleWorkspaceSetup,
  InstructionTestConnection,
} from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-connection-components';
import { InstructionCopyValue } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-copy-value';
import { InstructionMarkdown } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-markdown';
import { InstructionTabs } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-tabs';
import {
  CONFIGURE_CONNECTION_CONTENT_TYPES,
  COPY_VALUE_CONTENT_TYPES,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { InstructionRenderers } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/** Built-in renderers; anything else can be added or replaced through `renderers`. */
export const DEFAULT_INSTRUCTION_RENDERERS: InstructionRenderers = {
  markdown_component: InstructionMarkdown,
  tabs_component: InstructionTabs,
  ...Object.fromEntries(
    Object.keys(COPY_VALUE_CONTENT_TYPES).map((type) => [type, InstructionCopyValue]),
  ),
  ...Object.fromEntries(
    CONFIGURE_CONNECTION_CONTENT_TYPES.map((type) => [type, InstructionConfigureConnection]),
  ),
  attribute_mapping_list_component: InstructionAttributeMapping,
  test_connection_component: InstructionTestConnection,
  google_workspace_setup_component: InstructionGoogleWorkspaceSetup,
};
