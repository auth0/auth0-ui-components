/**
 * React.useSyncExternalStore compatibility utility.
 * @module use-sync-external-store-compat
 * @internal
 */

import * as React from 'react';

type Subscribe = (onChange: () => void) => () => void;

/**
 * Shim for React.useSyncExternalStore on React 16 and 17. Reads the snapshot on every render, and
 * renders again when the store changes it.
 * @param subscribe - Subscribes to the store and returns the unsubscribe function.
 * @param getSnapshot - Returns the current snapshot. It must return the same value until the store changes.
 * @returns The current snapshot.
 */
function useSyncExternalStoreShim<T>(subscribe: Subscribe, getSnapshot: () => T): T {
  const value = getSnapshot();
  const [, rerender] = React.useReducer((count: number) => count + 1, 0);

  const latest = React.useRef({ value, getSnapshot });
  latest.current = { value, getSnapshot };

  React.useEffect(() => {
    const checkForChange = () => {
      if (!Object.is(latest.current.value, latest.current.getSnapshot())) rerender();
    };
    checkForChange();
    return subscribe(checkForChange);
  }, [subscribe]);

  return value;
}

/**
 * Reads `useSyncExternalStore` off the React namespace, or returns undefined before React 18.
 *
 * The access is computed (`React[key]`) for the same reason as in `use-id-compat`: a static member
 * access makes bundlers fail ESM linking against React 16 and 17, which have no such export.
 * @returns React's native hook on React 18+, otherwise undefined.
 */
function getNativeUseSyncExternalStore(): typeof React.useSyncExternalStore | undefined {
  const key = ['useSync', 'ExternalStore'].join('');
  return (React as { useSyncExternalStore?: typeof React.useSyncExternalStore })[
    key as 'useSyncExternalStore'
  ];
}

const nativeUseSyncExternalStore = getNativeUseSyncExternalStore();

/**
 * Subscribes a component to an external store.
 * Uses React.useSyncExternalStore natively on React 18+, falls back to a state-based shim before.
 */
export const useSyncExternalStore: typeof React.useSyncExternalStore =
  typeof nativeUseSyncExternalStore === 'function'
    ? nativeUseSyncExternalStore
    : useSyncExternalStoreShim;
