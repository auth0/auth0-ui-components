import * as React from 'react';
import { I18nContext } from '@/providers/i18n-provider';

/**
 * React hook for using translations within a specific namespace.
 * Supports both global translations and local overrides.
 *
 * @param namespace - Translation namespace (e.g., 'mfa', 'auth')
 * @param overrides - Optional translations to override defaults
 * @returns Scoped translation function
 */
export function useI18n(namespace: string, overrides?: Record<string, unknown>) {
  const { translator, initialized } = React.useContext(I18nContext);

  // Memoize overrides to prevent unnecessary re-renders
  const memoizedOverrides = React.useMemo(() => overrides, [JSON.stringify(overrides)]);

  return React.useCallback(
    (key: string, vars?: Record<string, unknown>): string => {
      if (!initialized || !translator) {
        return key;
      }

      return translator(namespace)(key, vars, memoizedOverrides);
    },
    [namespace, translator, initialized, memoizedOverrides],
  );
}
