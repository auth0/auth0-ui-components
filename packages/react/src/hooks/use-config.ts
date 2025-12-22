import * as React from 'react';

import type { Auth0ComponentConfig } from '../types/auth-types';

export const Auth0ComponentConfigContext = React.createContext<{
  config: Auth0ComponentConfig;
}>({
  config: {
    themeSettings: { mode: 'light' },
    customOverrides: {},
    loader: undefined,
  },
});

/**
 * Hook to access the Auth0 component configuration from context.
 */
export function useComponentConfig(): { config: Auth0ComponentConfig } {
  const context = React.useContext(Auth0ComponentConfigContext);

  if (!context) {
    throw new Error('useComponentConfig must be used within an Auth0ComponentProvider');
  }

  return context;
}
