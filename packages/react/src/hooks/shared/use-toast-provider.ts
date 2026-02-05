import { useEffect, useMemo } from 'react';

import { setGlobalToastSettings } from '@/components/auth0/shared/toast';
import { DEFAULT_TOAST_SETTINGS, type ToastSettings } from '@/types/toast-types';

/**
 * Custom hook to manage toast settings for providers
 */
export const useToastProvider = (toastSettings?: ToastSettings) => {
  const mergedToastSettings = useMemo(() => {
    if (!toastSettings) {
      return DEFAULT_TOAST_SETTINGS;
    }

    if (toastSettings.provider === 'custom') {
      return toastSettings;
    }

    const defaultSonnerSettings =
      DEFAULT_TOAST_SETTINGS.provider === 'sonner' ? DEFAULT_TOAST_SETTINGS.settings || {} : {};

    return {
      provider: 'sonner' as const,
      settings: {
        ...defaultSonnerSettings,
        ...(toastSettings.provider === 'sonner' ? toastSettings.settings : {}),
      },
    } satisfies ToastSettings;
  }, [toastSettings]);

  useEffect(() => {
    setGlobalToastSettings(mergedToastSettings);
  }, [mergedToastSettings]);

  return mergedToastSettings;
};
