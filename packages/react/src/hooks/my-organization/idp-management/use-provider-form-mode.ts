import { useMemo } from 'react';

import type { FormMode } from '../../../types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Custom hook to determine provider form behavior based on mode
 * @param mode - The form mode ('create' | 'edit')
 * @returns Object containing form mode configuration
 */
export const useProviderFormMode = (mode: FormMode = 'create') => {
  return useMemo(
    () => ({
      showCopyButtons: mode === 'edit',
    }),
    [mode],
  );
};
