/**
 * Instruction pages for the SSO guided setup.
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
 * Loads the instructions and builds the page flow.
 * @param options - Hook options.
 * @param options.kind - `creation` or `provisioning`.
 * @param options.strategy - IdP strategy.
 * @param options.enabled - Extra gate for loading.
 * @param options.hideLifecycleWarnings - Hides the out-of-date notice.
 * @param options.provider - The created provider, if any.
 * @param options.attributeMappings - Mappings supplied by the host.
 * @param options.entryContext - Entry condition overrides.
 * @param options.initialPageKey - Page to start on.
 * @returns The flow, loading state, company name and lifecycle state.
 */
export function useGuidedSetupPages({
  kind,
  strategy,
  enabled,
  hideLifecycleWarnings = false,
  provider,
  attributeMappings,
  entryContext,
  initialPageKey,
}: UseGuidedSetupPagesOptions): UseGuidedSetupPagesResult {
  const { instructions, isLoading, error, companyName } = useGuidedSetupInstructions(
    kind,
    strategy,
    enabled,
  );
  const lifecycleStatus = instructions?.version_info?.lifecycle_status;
  const isDeprecated = lifecycleStatus === 'deprecated';
  const [isOutOfDateDismissed, setOutOfDateDismissed] = React.useState(false);
  const showOutOfDate =
    lifecycleStatus === 'out_of_date' && !hideLifecycleWarnings && !isOutOfDateDismissed;
  const dismissOutOfDate = React.useCallback(() => setOutOfDateDismissed(true), []);

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
    () => ({ connectionExists: Boolean(provider), googleWorkspaceSetupComplete: false }),
    [provider],
  );

  const flow = useGuidedSetupFlow({
    pages: !isDeprecated && instructions?.pages ? instructions.pages : EMPTY_INSTRUCTION_PAGES,
    entryContext: resolvedEntryContext,
    exitState,
    initialPageKey,
  });

  return { flow, isLoading, error, companyName, isDeprecated, showOutOfDate, dismissOutOfDate };
}
