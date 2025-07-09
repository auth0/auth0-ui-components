import { useMemo } from 'react';
import { createTranslator, type TranslationFunction } from '@auth0-web-ui-components/core';

/**
 * Custom hook for creating a memoized translator function.
 *
 * This hook wraps the createTranslator function and memoizes the result
 * to prevent unnecessary recreations on every render, improving performance.
 *
 * @param namespace - The translation namespace (e.g., 'mfa', 'common')
 * @param localization - Optional localization overrides object
 * @returns A memoized translator function
 *
 * @example
 * ```tsx
 * // Basic usage with namespace only
 * const t = useTranslator('common');
 *
 * // Usage with localization overrides
 * const t = useTranslator('mfa', localization);
 *
 * // Using the translator
 * const title = t('title');
 * const message = t('welcome', { name: 'John' });
 * ```
 */
export function useTranslator(
  namespace: string,
  localization?: Record<string, unknown>,
): TranslationFunction {
  return useMemo(() => createTranslator(namespace, localization), [namespace, localization]);
}
