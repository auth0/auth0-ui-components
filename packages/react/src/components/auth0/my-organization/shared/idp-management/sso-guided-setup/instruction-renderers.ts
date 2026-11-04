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
import {
  COPY_VALUE_CONTENT_TYPES,
  InstructionCopyValue,
} from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-copy-value';
import { InstructionMarkdown } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-markdown';
import { InstructionTabs } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-tabs';
import type { InstructionRenderers } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

const CONFIGURE_CONNECTION_CONTENT_TYPES = [
  'okta_configure_connection_component',
  'oidc_configure_connection_component',
  'samlp_configure_connection_component',
  'adfs_configure_connection_component',
  'waad_configure_connection_component',
  'google_apps_configure_connection_component',
  'pingfederate_configure_connection_component',
] as const;

/**
 * Built-in renderers. Provisioning-only types (SCIM endpoint, bearer token, Okta schema URN) are
 * added with the provisioning setup page; anything else can be added or replaced through
 * `renderers`.
 */
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
