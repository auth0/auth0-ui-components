/**
 * Provider form mode configuration hook.
 * @module use-provider-form-mode
 */

import { useMemo } from 'react';

import type { FormMode } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Hook to determine form behavior based on create/edit mode.
 * @param mode - Form mode.
 * @returns Form mode configuration.
 */
export const useProviderFormMode = (mode: FormMode = 'create') => {
  return useMemo(
    () => ({
      showCopyButtons: mode === 'edit',
    }),
    [mode],
  );
};
