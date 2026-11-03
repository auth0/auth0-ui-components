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

import {
  InstructionContents,
  InstructionRenderersProvider,
} from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-contents';
import { DEFAULT_INSTRUCTION_RENDERERS } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-renderers';
import { cn } from '@/lib/utils';
import type { InstructionRenderers } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

export interface InstructionsPageProps {
  page: IdpInstructionsPage | IdpProvisioningInstructionsPage;
  renderers?: InstructionRenderers;
  className?: string;
}

/**
 * Renders a page's content items in order through the renderer registry. Unknown content types
 * render nothing. Must be used under `SsoGuidedSetupProvider`.
 * @param props - Component props.
 * @param props.page - Instructions page.
 * @param props.renderers - Extra or replacement renderers.
 * @param props.className - Wrapper class names.
 * @returns JSX element
 */
export function InstructionsPage({ page, renderers, className }: InstructionsPageProps) {
  const registry = React.useMemo(
    () => ({ ...DEFAULT_INSTRUCTION_RENDERERS, ...renderers }),
    [renderers],
  );

  return (
    <div className={cn('space-y-4', className)} data-slot="instructions-page" data-page={page.key}>
      <InstructionRenderersProvider renderers={registry}>
        <InstructionContents contents={page.contents} />
      </InstructionRenderersProvider>
    </div>
  );
}
