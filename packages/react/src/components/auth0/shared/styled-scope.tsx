/**
 * Auth0Scope component — CSS scope root and portal container for lib components.
 * @module auth0-scope
 * @internal
 */

'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ThemeContext } from '@/providers/theme-provider';

export interface StyledScopeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * CSS scope root for lib components. Handles dark-mode class and theme attribute.
 *
 * @param props - Component props.
 * @param props.children - Content to render inside the scope root.
 * @param props.style - Optional inline CSS styles.
 * @returns A scoped wrapper div with dark-mode and theme attributes applied.
 * @internal
 */
export const StyledScope: React.FC<StyledScopeProps> = ({ children, style }) => {
  const { theme = 'default', isDarkMode } = React.useContext(ThemeContext);

  return (
    <div className={cn('auth0-universal', isDarkMode && 'dark')} data-theme={theme} style={style}>
      {children}
    </div>
  );
};
