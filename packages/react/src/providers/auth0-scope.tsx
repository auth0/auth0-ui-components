/**
 * Auth0Scope component — CSS scope root and portal container for lib components.
 * @module auth0-scope
 * @internal
 */

'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ThemeContext } from '@/providers/theme-provider';

/**
 * CSS scope root for lib components. Handles dark-mode class and theme attribute.
 *
 * @param root0 - Component props.
 * @param root0.children - Content to render inside the scope root.
 * @returns A scoped wrapper div with dark-mode and theme attributes applied.
 * @internal
 */
export const Auth0Scope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme = 'default', isDarkMode } = React.useContext(ThemeContext);

  return (
    <div className={cn('auth0-universal', isDarkMode && 'dark')} data-theme={theme}>
      {children}
    </div>
  );
};
