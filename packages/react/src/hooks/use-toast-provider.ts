import { useEffect, useMemo } from 'react';

import { setGlobalToastSettings } from '../components/ui/toast';
import { DEFAULT_TOAST_SETTINGS, type ToastSettings } from '../types/toast-types';

/**
 * Custom hook to manage toast settings for providers
 * Handles memoization, global state setting, and provides clean configuration
 *
 * @param toastSettings - Toast configuration from provider props
 * @returns Toast settings with defaults applied
 */
export const useToastProvider = (toastSettings?: ToastSettings) => {
  // Memoize toast settings with defaults (handles undefined toastSettings)
  const mergedToastSettings = useMemo(
    () => ({
      ...DEFAULT_TOAST_SETTINGS,
      ...(toastSettings || {}),
    }),
    [toastSettings],
  );

  // Set global toast settings when provider mounts or settings change
  useEffect(() => {
    setGlobalToastSettings(mergedToastSettings);
  }, [mergedToastSettings]);

  return mergedToastSettings;
};
