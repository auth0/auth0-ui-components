import * as React from 'react';
import type { Auth0ComponentContextType } from './types';

/**
 * Auth0ComponentContext
 *
 * React Context that provides configuration and authentication state
 * related to Auth0 integration throughout the component tree.
 *
 * The context value includes:
 * - `authProxyUrl`: Optional URL for proxy mode
 * - `i18nConfig`: Internationalization settings (current and fallback languages)
 * - `themeSettings`: Theme and branding configurations
 * - `customOverrides`: Optional CSS variable overrides
 * - `loader`: Custom loading component
 * - `translator`: i18n translation factory function
 * - `isProxyMode`: Boolean indicating whether proxy mode is active
 * - `apiBaseUrl`: Base URL used for API calls (proxy URL or Auth0 domain)
 * - `authDetails` (optional): Authentication details such as access tokens,
 *   domain, client ID, scopes, loading state, and any errors. Present only in SPA mode.
 *
 * This context is intended to be consumed by any component needing access to Auth0 configuration,
 * theming, internationalization, or authentication status.
 */
export const Auth0ComponentContext = React.createContext<Auth0ComponentContextType>({
  authProxyUrl: undefined,
  i18nConfig: { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  themeSettings: { mode: 'light' },
  customOverrides: {},
  loader: undefined,
  isProxyMode: false,
  apiBaseUrl: undefined,
  authDetails: undefined,
});
