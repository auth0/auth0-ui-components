'use client';

import * as React from 'react';

/**
 * React context that stores the target HTML element used as a portal container
 * for overlay-based UI (for example, dialogs, popovers, and tooltips).
 *
 */
export const PortalContext = React.createContext<HTMLElement | null>(null);

/**
 * Returns the current portal container element from `PortalContext`.
 *
 * @returns The configured portal host element, or `null` when not provided.
 */
export function usePortalContainer() {
  return React.useContext(PortalContext);
}
