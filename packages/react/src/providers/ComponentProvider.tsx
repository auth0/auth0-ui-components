'use client';

import * as React from 'react';
import { I18nProvider } from './I18nProvider';
import type { I18nOptions } from '@auth0-ui-components/core';

/**
 * Theme configuration for the Auth0 components
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
interface ThemeSettings {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  [key: string]: unknown;
}

/**
 * Configuration options for Auth0ComponentProvider
 * @property {string} [authProxyUrl] - URL for authentication proxy (RWA mode)
 * @property {I18nOptions} [i18n] - Internationalization options
 * @property {ThemeSettings} [themeSettings] - Theme configuration
 */
export interface Auth0ComponentConfig {
  authProxyUrl?: string;
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
}

/**
 * Context for providing Auth0 component configuration
 * Initialized with default values for i18n and theme
 */
export const Auth0ComponentContext = React.createContext<{
  config: Auth0ComponentConfig;
}>({ 
  config: { 
    i18n: { currentLanguage: 'en', fallbackLanguage: 'en' }, 
    themeSettings: { mode: 'light' } 
  } 
});

Auth0ComponentContext.displayName = 'Auth0ComponentContext';

/**
 * Main provider component for Auth0 UI components
 * Manages authentication mode, internationalization, and theming
 * 
 * @example
 * ```tsx
 * <Auth0ComponentProvider
 *   authProxyUrl="/api/auth" // Optional: for RWA mode
 *   i18n={{ defaultLanguage: 'en' }}
 *   themeSettings={{ mode: 'dark' }}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 * ```
 */
export const Auth0ComponentProvider = React.memo(function Auth0ComponentProvider({
  children,
  authProxyUrl,
  i18n = {
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  },
  themeSettings = { mode: 'light' },
}: Auth0ComponentConfig & { children: React.ReactNode }) {
  // Memoize configuration to prevent unnecessary re-renders
  const config = React.useMemo(
    () => ({
      authProxyUrl,
      i18n,
      themeSettings,
    }),
    [authProxyUrl, i18n, themeSettings]
  );

  return (
    <Auth0ComponentContext.Provider value={{ config }}>
      <I18nProvider options={i18n}>
        {children}
      </I18nProvider>
    </Auth0ComponentContext.Provider>
  );
});

Auth0ComponentProvider.displayName = 'Auth0ComponentProvider';