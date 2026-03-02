/**
 * Theme configuration types.
 * @module theme-types
 */

import type { StylingVariables } from '@auth0/universal-components-core';
import type React from 'react';

/** Theme settings for provider. */
export interface ThemeSettings {
  theme?: 'default' | 'minimal' | 'rounded';
  mode?: 'light' | 'dark';
  variables?: StylingVariables;
}

/** Theme input for ThemeProvider. */
export type ThemeInput = {
  theme?: 'default' | 'minimal' | 'rounded';
  mode?: 'light' | 'dark';
  variables?: StylingVariables;
  loader?: React.ReactNode;
};

/** Theme context value. */
export type ThemeContextValue = {
  theme?: 'default' | 'minimal' | 'rounded';
  isDarkMode?: boolean;
  variables: StylingVariables;
  loader: React.ReactNode | null;
};
