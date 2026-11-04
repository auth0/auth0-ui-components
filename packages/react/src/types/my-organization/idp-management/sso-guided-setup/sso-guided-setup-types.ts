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

/** Content filled in by other features (test connection, Google Workspace setup). */
export interface SsoGuidedSetupSlots {
  testConnection?: React.ReactNode;
  googleWorkspaceSetup?: React.ReactNode;
}

/** Values every instruction content component can read. */
export interface SsoGuidedSetupContextValue {
  kind: InstructionsKind;
  strategy: IdpStrategy;
  mode?: 'create' | 'edit';
  baseUrl?: string;
  tenant?: string;
  connectionName?: string;
  companyName?: string;
  provider?: IdpKnownResponse | null;
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
  configure?: SsoGuidedSetupConfigureForm;
  attributeMappings?: IdpUserAttributeMapItem[] | IdpProvisioningUserAttributeMapItem[] | null;
  slots?: SsoGuidedSetupSlots;
  customMessages?: Partial<Record<string, unknown>>;
}

/** Props every instruction content component receives. */
export interface InstructionContentProps {
  content: InstructionContent;
}

/** Content type → component that renders it. */
export type InstructionRenderers = Partial<
  Record<string, React.ComponentType<InstructionContentProps>>
>;
