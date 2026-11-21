/**
 * Instructions pages and navigation state for the SSO guided setup.
 * @module use-guided-setup-pages
 */

import * as React from 'react';

import { useGuidedSetupFlow } from '@/hooks/my-organization/idp-management/sso-guided-setup/use-guided-setup-flow';
import { useGuidedSetupInstructions } from '@/hooks/my-organization/idp-management/sso-guided-setup/use-guided-setup-instructions';
import { EMPTY_INSTRUCTION_PAGES } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { getProviderAttributes } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import type {
  UseGuidedSetupPagesOptions,
  UseGuidedSetupPagesResult,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Loads the instructions and tracks which page is shown. Mappings count as present before the
 * provider exists, and group provisioning is off unless the caller says otherwise.
 * @param options - Hook options.
 * @param options.kind - `creation` or `provisioning`.
 * @param options.strategy - IdP strategy.
 * @param options.enabled - Extra gate for loading.
 * @param options.provider - The created provider, if any.
 * @param options.attributeMappings - Attribute mappings supplied by the host.
 * @param options.entryContext - Overrides for the entry condition facts.
 * @param options.googleWorkspaceSetupComplete - Whether the Google Workspace setup is done.
 * @param options.initialPageKey - Page to start on.
 * @returns The flow, the loading state and the name for `{{companyName}}`.
 */
export function useGuidedSetupPages({
  kind,
  strategy,
  enabled,
  provider,
  attributeMappings,
  entryContext,
  googleWorkspaceSetupComplete = false,
  initialPageKey,
}: UseGuidedSetupPagesOptions): UseGuidedSetupPagesResult {
  const { instructions, isLoading, error, companyName } = useGuidedSetupInstructions(
    kind,
    strategy,
    enabled,
  );
  const mappings =
    attributeMappings ?? (kind === 'creation' ? getProviderAttributes(provider) : null);
  const mappingCount = mappings?.length ?? 0;

  const resolvedEntryContext = React.useMemo(
    () => ({
      hasMappings: entryContext?.hasMappings ?? (provider ? mappingCount > 0 : true),
      groupProvisioningEnabled: entryContext?.groupProvisioningEnabled ?? false,
    }),
    [entryContext?.hasMappings, entryContext?.groupProvisioningEnabled, provider, mappingCount],
  );

  const exitState = React.useMemo(
    () => ({ connectionExists: Boolean(provider), googleWorkspaceSetupComplete }),
    [provider, googleWorkspaceSetupComplete],
  );

  const flow = useGuidedSetupFlow({
    pages: instructions?.pages ?? EMPTY_INSTRUCTION_PAGES,
    entryContext: resolvedEntryContext,
    exitState,
    initialPageKey,
  });

  return { flow, isLoading, error, companyName };
}
