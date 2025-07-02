import * as React from 'react';
import type { Auth0ComponentConfig } from '@/providers/types';

export const Auth0ComponentConfigContext = React.createContext<{
  config: Auth0ComponentConfig;
}>({
  config: {
    authProxyUrl: undefined,
    i18n: { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
    themeSettings: { mode: 'light' },
    customOverrides: {},
    loader: undefined,
    isProxyMode: false,
  },
});

/**
 * Hook to access the Auth0 component configuration from context.
 *
 * Provides authentication mode, internationalization settings, and theming config.
 *
 * @returns {{ config: Auth0ComponentConfig }} The current Auth0 component configuration.
 *
 * @throws {Error} Throws if used outside of an Auth0ComponentProvider.
 *
 * @example
 * ```tsx
 * function AuthenticatedButton() {
 *   const { config } = useAuth0ComponentConfig();
 *
 *
 *   const isDark = config.themeSettings?.mode === 'dark';
 *
 *   return (
 *     <button className={isDark ? 'dark' : 'light'}>
 *       {config.isProxyMode ? 'RWA Mode' : 'SPA Mode'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useComponentConfig(): { config: Auth0ComponentConfig } {
  const context = React.useContext(Auth0ComponentConfigContext);

  if (!context) {
    throw new Error('useComponentConfig must be used within an Auth0ComponentProvider');
  }

  return context;
}
