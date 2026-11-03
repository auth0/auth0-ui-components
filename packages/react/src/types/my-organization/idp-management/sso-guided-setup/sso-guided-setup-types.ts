/**
 * Types for the SSO guided setup (instructions rendering).
 * @module sso-guided-setup-types
 * @internal
 */

import type {
  IdpInstructionsPageContent,
  IdpInstructionsTabContent,
  IdpKnownResponse,
  IdpProvisioningInstructionsPageContent,
  IdpStrategy,
  InstructionsKind,
} from '@auth0/universal-components-core';
import type * as React from 'react';

/** A content item from a creation or provisioning instructions page, or from a tab. */
export type InstructionContent =
  | IdpInstructionsPageContent
  | IdpProvisioningInstructionsPageContent
  | IdpInstructionsTabContent;

/** Values every instruction content component can read. */
export interface SsoGuidedSetupContextValue {
  kind: InstructionsKind;
  strategy: IdpStrategy;
  baseUrl?: string;
  tenant?: string;
  connectionName?: string;
  companyName?: string;
  provider?: IdpKnownResponse | null;
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
