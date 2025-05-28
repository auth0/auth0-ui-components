import * as React from 'react';
import { Auth0ComponentContext } from '@/providers/ComponentProvider';
import type { Auth0ComponentConfig } from '@/providers/ComponentProvider';

/**
 * Hook for accessing Auth0 component configuration
 * Provides access to authentication mode, i18n settings, and theme configuration
 * 
 * @returns {Object} Configuration object containing:
 * - `authProxyUrl`: URL for authentication proxy in RWA mode
 * - `i18n`: Internationalization settings
 * - `themeSettings`: Theme configuration including mode and colors
 * 
 * @throws {Error} If used outside of Auth0ComponentProvider
 * 
 * @example
 * ```tsx
 * function AuthenticatedButton() {
 *   const { config } = useAuth0Component();
 * 
 *   const isRWA = Boolean(config.authProxyUrl);
 *   const isDark = config.themeSettings?.mode === 'dark';
 * 
 *   return (
 *     <button className={isDark ? 'dark' : 'light'}>
 *       {isRWA ? 'RWA Mode' : 'SPA Mode'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuth0Component(): { config: Auth0ComponentConfig } {
  const context = React.useContext(Auth0ComponentContext);

  if (!context) {
    throw new Error(
      'useAuth0Component must be used within Auth0ComponentProvider'
    );
  }

  return context;
}