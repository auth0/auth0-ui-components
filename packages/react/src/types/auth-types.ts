/**
 * Auth provider configuration types.
 * @module auth-types
 */

import type { AuthDetails } from '@auth0/universal-components-core';
import type * as React from 'react';

import type { QueryCacheConfig } from '@/types/cache-types';
import type { I18nOptions } from '@/types/i18n-types';
import type { ThemeSettings } from '@/types/theme-types';
import type { ToastSettings } from '@/types/toast-types';

/** Props for Auth0ComponentProvider. */
export type Auth0ComponentProviderProps = (
  | {
      mode?: 'direct';
      authContext?: AuthDetails['contextInterface'];
      proxyConfig?: never;
    }
  | { mode: 'proxy'; domain: string; proxyConfig: { baseUrl: string } }
) & {
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  loader?: React.ReactNode;
  toastSettings?: ToastSettings;
  /** TanStack Query cache config. Use `{ enabled: false }` to disable. */
  cacheConfig?: QueryCacheConfig;
  previewMode?: boolean;
};
