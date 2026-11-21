/**
 * Provider creation for the SSO guided setup.
 * @module use-guided-setup-creation
 */

import * as React from 'react';

import { resolveOrFalse } from '@/lib/utils/shared/helper-utils';
import type {
  UseGuidedSetupCreationOptions,
  UseGuidedSetupCreationResult,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Handles the primary button and provider creation.
 * @param options - Hook options.
 * @param options.flow - Navigation state.
 * @param options.provider - The created provider, if any.
 * @param options.onBeforeCreate - Runs before the confirmation.
 * @param options.onCreateProvider - Creates the provider.
 * @param options.onComplete - Runs when the last page is finished.
 * @returns Primary action and confirmation modal state.
 */
export function useGuidedSetupCreation({
  flow,
  provider,
  onBeforeCreate,
  onCreateProvider,
  onComplete,
}: UseGuidedSetupCreationOptions): UseGuidedSetupCreationResult {
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const [isCreating, setCreating] = React.useState(false);
  const [createdFromPageKey, setCreatedFromPageKey] = React.useState<string | null>(null);
  const currentPageKey = flow.currentPage?.key;
  const isAwaitingProvider = createdFromPageKey !== null && !provider;

  React.useEffect(() => {
    if (createdFromPageKey === null || !provider) return;
    setCreatedFromPageKey(null);
    if (currentPageKey === createdFromPageKey) flow.goNext();
  }, [createdFromPageKey, currentPageKey, provider, flow]);

  const needsCreate = flow.currentPage?.exit_condition === 'connection_exists' && !provider;

  const handlePrimary = async () => {
    if (isAwaitingProvider) return;
    if (needsCreate) {
      const canCreate = onBeforeCreate ? await resolveOrFalse(onBeforeCreate) : true;
      if (canCreate) setConfirmOpen(true);
      return;
    }
    if (flow.isLastPage) {
      if (flow.canLeaveCurrentPage) onComplete?.();
      return;
    }
    flow.goNext();
  };

  const handleProceed = async () => {
    if (isAwaitingProvider || isCreating) return;
    setCreating(true);
    try {
      const created = onCreateProvider ? await resolveOrFalse(onCreateProvider) : false;
      if (created) {
        setConfirmOpen(false);
        setCreatedFromPageKey(currentPageKey ?? null);
      }
    } finally {
      setCreating(false);
    }
  };

  let primaryLabelKey: UseGuidedSetupCreationResult['primaryLabelKey'] = 'next';
  if (needsCreate) primaryLabelKey = 'create_provider';
  else if (flow.isLastPage) primaryLabelKey = 'done';

  return {
    isConfirmOpen,
    setConfirmOpen,
    isCreating,
    primaryLabelKey,
    isPrimaryDisabled: isAwaitingProvider || (!needsCreate && !flow.canLeaveCurrentPage),
    handlePrimary,
    handleProceed,
  };
}
