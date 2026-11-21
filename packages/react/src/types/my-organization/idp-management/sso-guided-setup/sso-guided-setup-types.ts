/**
 * Types for the SSO guided setup (instructions rendering).
 * @module sso-guided-setup-types
 * @internal
 */

import type {
  IdpInstructionsLocale,
  IdpInstructionsPage,
  IdpInstructionsPageContent,
  IdpInstructionsTabContent,
  IdpInstructionsResponse,
  IdpKnownResponse,
  IdpProvisioningInstructionsPage,
  IdpProvisioningInstructionsPageContent,
  IdpProvisioningInstructionsResponse,
  IdpStrategy,
  InstructionsKind,
} from '@auth0/universal-components-core';
import type * as React from 'react';

/** A content item from a creation or provisioning instructions page, or from a tab. */
export type InstructionContent =
  | IdpInstructionsPageContent
  | IdpProvisioningInstructionsPageContent
  | IdpInstructionsTabContent;

/** UI state the guided setup passes to every instruction content component. */
export interface InstructionSetup {
  kind: InstructionsKind;
  strategy: IdpStrategy;
  connectionName?: string;
  provider?: IdpKnownResponse | null;
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
  companyName: string | undefined;
}
