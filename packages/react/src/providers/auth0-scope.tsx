/**
 * Auth0Scope component — CSS scope root and portal container for lib components.
 * @module auth0-scope
 * @internal
 */

'use client';

import { getCoreStyles } from '@auth0/universal-components-core';
import * as React from 'react';

// import { PortalContext } from '@/providers/portal-context';
import { cn } from '@/lib/utils';
import { ThemeContext } from '@/providers/theme-provider';

/**
 * Renders the `.auth0-universal` scope root and a sibling portal container.
 *
 * Encapsulates CSS scoping, dark-mode class toggling, and CSS variable
 * application that previously lived in `ThemeProvider`. Each top-level
 * feature component wraps its view root with this component so that
 * scoping works even when the component is used outside a full provider tree.
 *
 * @param root0 - Component props.
 * @param root0.children - Content rendered inside the scope root.
 * @returns The scoped root element with an adjacent portal container.
 * @internal
 */
export const Auth0Scope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme = 'default', variables, isDarkMode } = React.useContext(ThemeContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const portalRef = React.useRef<HTMLDivElement>(null);
  const [_portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  // Synchronously capture the portal container before paint — eliminates the
  // null-flash that occurred with useState + ref-callback in ThemeProvider.
  React.useLayoutEffect(() => {
    setPortalContainer(portalRef.current);
  }, []);

  // Apply CSS variables and dark-mode class directly to this scope's elements.
  React.useEffect(() => {
    const resolvedDark = isDarkMode ?? false;
    const { variables: cssVars } = getCoreStyles(variables, resolvedDark);

    [rootRef.current, portalRef.current].forEach((el) => {
      if (!el) return;
      el.setAttribute('data-theme', theme);
      el.classList.toggle('dark', resolvedDark);
      Object.entries(cssVars).forEach(([key, value]) => {
        if (typeof value === 'string') el.style.setProperty(key, value);
      });
    });
  }, [variables, isDarkMode, theme]);

  return (
    <div className={cn('auth0-universal', isDarkMode && 'dark')} data-theme={theme} ref={rootRef}>
      {children}
    </div>
  );
};
