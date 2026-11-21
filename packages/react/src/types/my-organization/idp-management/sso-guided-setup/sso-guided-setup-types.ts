/**
 * Types for the SSO guided setup (instructions rendering).
 * @module sso-guided-setup-types
 * @internal
 */

import type {
  ExitConditionPolicy,
  IdpInstructionsLocale,
  IdpInstructionsPage,
  IdpProvisioningUserAttributeMapItem,
  IdpUserAttributeMapItem,
  IdpInstructionsPageContent,
  IdpInstructionsTabContent,
  IdpInstructionsResponse,
  IdpKnownResponse,
  IdpProvisioningInstructionsPage,
  IdpProvisioningInstructionsPageContent,
  IdpProvisioningInstructionsResponse,
  IdpStrategy,
  InstructionsEntryContext,
  InstructionsExitState,
  InstructionsFlowPage,
  InstructionsKind,
  ServiceProviderValues,
  SsoGuidedSetupMessages,
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

export interface InstructionContentsProps {
  contents: readonly InstructionContent[];
  setup: InstructionSetup;
  renderers: InstructionRenderers;
}

export interface InstructionsPageProps {
  page: IdpInstructionsPage | IdpProvisioningInstructionsPage;
  setup: InstructionSetup;
  renderers?: InstructionRenderers;
  className?: string;
}

export type InstructionsResponseFor<TKind extends InstructionsKind> = TKind extends 'creation'
  ? IdpInstructionsResponse
  : IdpProvisioningInstructionsResponse;

export interface UseIdpInstructionsServiceOptions<TKind extends InstructionsKind> {
  kind: TKind;
  strategy: IdpStrategy | undefined;
  locale: IdpInstructionsLocale;
  enabled?: boolean;
}

export interface UseIdpInstructionsServiceResult<TKind extends InstructionsKind> {
  instructions: InstructionsResponseFor<TKind> | null;
  isLoading: boolean;
  error: unknown;
}

export interface UseGuidedSetupInstructionsResult<TKind extends InstructionsKind>
  extends UseIdpInstructionsServiceResult<TKind> {
  baseUrl: string | undefined;
  companyName: string;
}

export interface SsoGuidedSetupProps
  extends Pick<
    InstructionSetup,
    | 'connectionName'
    | 'provider'
    | 'resolveSamlMetadata'
    | 'configure'
    | 'attributeMappings'
    | 'attributeMappingsError'
    | 'slots'
  > {
  strategy: IdpStrategy;
  kind?: InstructionsKind;
  entryContext?: Partial<InstructionsEntryContext>;
  initialPageKey?: string;
  renderers?: InstructionRenderers;
  enabled?: boolean;
  isSubmitting?: boolean;
  onBeforeCreate?: () => Promise<boolean> | boolean;
  onCreateProvider?: () => Promise<boolean>;
  onComplete?: () => void;
  onLeavePage?: (page: InstructionsPageItem) => void;
  customMessages?: Partial<SsoGuidedSetupMessages>;
  className?: string;
}

export interface SsoGuidedSetupCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  isCreating?: boolean;
  companyName: string;
  customMessages?: Partial<SsoGuidedSetupMessages>;
}

export interface CopyValueDefinition {
  value: keyof ServiceProviderValues;
  messageKey: string;
}

export type InstructionsPageItem = IdpInstructionsPage | IdpProvisioningInstructionsPage;

export interface UseGuidedSetupFlowOptions<TPage extends InstructionsFlowPage> {
  pages: readonly TPage[];
  entryContext: InstructionsEntryContext;
  exitState: InstructionsExitState;
  initialPageKey?: string;
}

export interface UseGuidedSetupFlowResult<TPage extends InstructionsFlowPage> {
  visiblePages: TPage[];
  currentIndex: number;
  currentPage: TPage | undefined;
  isFirstPage: boolean;
  isLastPage: boolean;
  canLeaveCurrentPage: boolean;
  currentExitPolicy: ExitConditionPolicy | undefined;
  goNext: () => boolean;
  goToPage: (index: number) => boolean;
}

export interface UseGuidedSetupPagesOptions {
  kind: InstructionsKind;
  strategy: IdpStrategy;
  enabled?: boolean;
  provider: IdpKnownResponse | null;
  attributeMappings?: InstructionSetup['attributeMappings'];
  entryContext?: Partial<InstructionsEntryContext>;
  initialPageKey?: string;
}

export interface UseGuidedSetupPagesResult {
  flow: UseGuidedSetupFlowResult<InstructionsPageItem>;
  isLoading: boolean;
  error: unknown;
  companyName: string;
}

export interface UseGuidedSetupCreationOptions
  extends Pick<SsoGuidedSetupProps, 'onBeforeCreate' | 'onCreateProvider' | 'onComplete'> {
  flow: UseGuidedSetupFlowResult<InstructionsPageItem>;
  provider: IdpKnownResponse | null;
  leavePage: (navigate: () => void) => void;
}

export interface UseGuidedSetupCreationResult {
  isConfirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  isCreating: boolean;
  primaryLabelKey: 'next' | 'create_provider' | 'done';
  isPrimaryDisabled: boolean;
  handlePrimary: () => Promise<void>;
  handleProceed: () => Promise<void>;
}
