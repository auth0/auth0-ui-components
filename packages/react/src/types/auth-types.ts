import type { AuthDetails } from '@auth0/universal-components-core';
import type * as React from 'react';

import type { QueryCacheConfig } from '@/types/cache-types';
import type { I18nOptions } from '@/types/i18n-types';
import type { ThemeSettings } from '@/types/theme-types';
import type { ToastSettings } from '@/types/toast-types';

/**
 * Props for the Auth0ComponentProvider component.
 */
export interface Auth0ComponentProviderProps {
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  authDetails?: AuthDetails;
  loader?: React.ReactNode;
  toastSettings?: ToastSettings;
  /**
   * Configuration for TanStack Query caching behavior.
   * Pass `{ enabled: false }` to disable caching.
   */
  cacheConfig?: QueryCacheConfig;
}
