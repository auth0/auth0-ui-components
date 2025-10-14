import type { AuthDetailsCore } from '@auth0-web-ui-components/core';
import type * as React from 'react';

import type { I18nOptions } from './i18n-types';
import type { ThemeSettings } from './theme-types';

/**
 * Auth0 authentication details with optional React-specific properties.
 */
export type AuthDetails = Omit<AuthDetailsCore, 'accessToken'>;

/**
 * Props for the Auth0ComponentProvider component.
 */
export interface Auth0ComponentProviderProps {
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  authDetails: AuthDetails;
  loader?: React.ReactNode;
}

/**
 * Props for the InternalProvider component.
 */
export interface InternalProviderProps {
  i18n?: I18nOptions;
  authDetails?: AuthDetails;
}

/**
 * Configuration for Auth0ComponentProvider excluding authentication details.
 */
export type Auth0ComponentConfig = Omit<Auth0ComponentProviderProps, 'authDetails' | 'i18n'>;
