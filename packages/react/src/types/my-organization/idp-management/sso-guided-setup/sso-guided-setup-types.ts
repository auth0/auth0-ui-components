/**
 * Types for the SSO guided setup (instructions rendering).
 * @module sso-guided-setup-types
 * @internal
 */

import type {
  IdpProvisioningUserAttributeMapItem,
  IdpUserAttributeMapItem,
  IdpInstructionsPageContent,
  IdpInstructionsTabContent,
  IdpKnownResponse,
  IdpProvisioningInstructionsPageContent,
  IdpStrategy,
  InstructionsKind,
} from '@auth0/universal-components-core';
import type * as React from 'react';

import type { ProviderConfigureFormHandle } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/** A content item from a creation or provisioning instructions page, or from a tab. */
export type InstructionContent =
  | IdpInstructionsPageContent
  | IdpProvisioningInstructionsPageContent
  | IdpInstructionsTabContent;

/** Strategy form shown by the configure connection content types. */
export interface SsoGuidedSetupConfigureForm {
  ref: React.Ref<ProviderConfigureFormHandle>;
  props: Omit<ProviderConfigureFieldsProps, 'strategy'>;
}

/** Content filled in by the page that hosts the guided setup or by other features. */
export interface SsoGuidedSetupSlots {
  bearerToken?: React.ReactNode;
  testConnection?: React.ReactNode;
  googleWorkspaceSetup?: React.ReactNode;
}

/** UI state the guided setup passes to every instruction content component. */
export interface InstructionSetup {
  kind: InstructionsKind;
  strategy: IdpStrategy;
  connectionName?: string;
  provider?: IdpKnownResponse | null;
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
  configure?: SsoGuidedSetupConfigureForm;
  attributeMappings?: IdpUserAttributeMapItem[] | IdpProvisioningUserAttributeMapItem[] | null;
  attributeMappingsError?: boolean;
  slots?: SsoGuidedSetupSlots;
  customMessages?: Partial<Record<string, unknown>>;
}

/** Props every instruction content component receives. */
export interface InstructionContentProps {
  content: InstructionContent;
  setup: InstructionSetup;
  renderers: InstructionRenderers;
}

/** Content type → component that renders it. */
export type InstructionRenderers = Partial<
  Record<string, React.ComponentType<InstructionContentProps>>
>;
