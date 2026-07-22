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
 * Reads `useId` off the React namespace, or returns undefined on React 17.
 *
 * The access is intentionally computed (`React[key]`, not `React.useId`): a
 * static member access makes bundlers like webpack treat it as a named-import
 * binding and fail ESM linking against React 17 — which has no `useId` export —
 * with `ESModulesLinkingError`, even though the runtime guard never reaches it.
 * A computed key the bundler can't resolve statically sidesteps that analysis.
 * @returns React's native useId on React 18+, otherwise undefined.
 */
function getNativeUseId(): (() => string) | undefined {
  const key = ['use', 'Id'].join('');
  return (React as { useId?: () => string })[key as 'useId'];
}

const nativeUseId = getNativeUseId();

/**
 * Returns a stable, unique ID for a component instance.
 * Uses React.useId natively on React 18+, falls back to a ref-based shim on React 17.
 */
export const useId: () => string = typeof nativeUseId === 'function' ? nativeUseId : useIdShim;
