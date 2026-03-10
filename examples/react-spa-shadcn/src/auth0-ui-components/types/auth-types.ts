import type { AuthDetails } from '@auth0/universal-components-core';
import type * as React from 'react';

import type { I18nOptions } from './i18n-types';
import type { ThemeSettings } from './theme-types';

/**
 * Props for the Auth0ComponentProvider component.
 */
export type Auth0ComponentProviderProps = (
  | {
      mode?: 'direct';
      domain: string;
      authContext?: AuthDetails['contextInterface'];
      previewMode?: boolean;
      proxyConfig?: never;
    }
  | { mode: 'proxy'; domain: string; proxyConfig: { baseUrl: string }; previewMode?: boolean }
) & {
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  loader?: React.ReactNode;
};

/**
 * Props for the InternalProvider component.
 */
export interface InternalProviderProps {
  i18n?: I18nOptions;
  authDetails: AuthDetails;
}

/**
 * Configuration for Auth0ComponentProvider excluding authentication details.
 */
export type Auth0ComponentConfig = Omit<
  Auth0ComponentProviderProps,
  'domain' | 'mode' | 'proxyConfig' | 'authContext' | 'i18n'
>;
