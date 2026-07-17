/**
 * Debounced value hook.
 * @module use-debounced-value
 * @internal
 */

import * as React from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` has
 * elapsed without further changes. Useful for throttling server-side search
 * requests driven by fast-changing input (e.g. a search-as-you-type field).
 * @param value - The value to debounce.
 * @param delayMs - Delay in milliseconds before the debounced value updates. Defaults to 300.
 * @returns The debounced value.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
