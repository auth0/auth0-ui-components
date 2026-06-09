/**
 * React.useId compatibility utility.
 * @module use-id-compat
 * @internal
 */

import * as React from 'react';

// The version check runs once at module load, not per render.
let idCounter = 0;

/**
 * Shim for React.useId on React 17. Generates a stable, unique ID per component
 * instance using useRef and a module-level counter.
 * @returns A stable ID string.
 */
function useIdShim(): string {
  const ref = React.useRef<string | null>(null);
  if (ref.current === null) {
    ref.current = `:r${idCounter++}:`;
  }
  return ref.current;
}

/**
 * Returns a stable, unique ID for a component instance.
 * Uses React.useId natively on React 18+, falls back to a ref-based shim on React 17.
 */
export const useId: () => string = 'useId' in React ? React.useId : useIdShim;
