/**
 * Debounced value hook.
 * @module use-debounced-value
 * @internal
 */

import * as React from 'react';

/**
 * Returns a debounced copy of `value` that updates after `delayMs`.
 * @param value - The value to debounce.
 * @param delayMs - Delay in ms before the debounced value updates. Defaults to 300.
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
