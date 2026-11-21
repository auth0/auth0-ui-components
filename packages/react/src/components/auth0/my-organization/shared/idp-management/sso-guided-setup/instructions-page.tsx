/**
 * Renders one instructions page's content.
 * @module instructions-page
 * @internal
 */

import type {
  IdpInstructionsPage,
  IdpProvisioningInstructionsPage,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { InstructionContents } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-contents';
import { DEFAULT_INSTRUCTION_RENDERERS } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-renderers';
import { cn } from '@/lib/utils';
import type {
  InstructionRenderers,
  InstructionSetup,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

export interface InstructionsPageProps {
  page: IdpInstructionsPage | IdpProvisioningInstructionsPage;
  setup: InstructionSetup;
  renderers?: InstructionRenderers;
  className?: string;
}

/**
 * Renders a page's content items in order through the renderer registry. Unknown content types
 * render nothing.
 * @param props - Component props.
 * @param props.page - Instructions page.
 * @param props.setup - Guided setup state for the renderers.
 * @param props.renderers - Extra or replacement renderers.
 * @param props.className - Wrapper class names.
 * @returns JSX element
 */
export function InstructionsPage({ page, setup, renderers, className }: InstructionsPageProps) {
  const registry = React.useMemo(
    () => ({ ...DEFAULT_INSTRUCTION_RENDERERS, ...renderers }),
    [renderers],
  );

  return (
    <div className={cn('space-y-6', className)} data-slot="instructions-page" data-page={page.key}>
      <InstructionContents contents={page.contents} setup={setup} renderers={registry} />
    </div>
  );
}
