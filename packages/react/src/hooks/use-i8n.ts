import { useState, useEffect } from 'react';
import { useComponentConfig } from './use-config';
import { getLocalizedComponentAsync } from '@auth0-web-ui-components/core';

/**
 * React hook to asynchronously fetch and manage localized string lookup function for a given component.
 *
 * The hook fetches the translations for the current language (falling back to a fallback language)
 * and returns a lookup function `t(key)` that returns the localized string or undefined if not found.
 *
 * While translations are loading or missing, the lookup function always returns undefined.
 *
 * @template T - The shape of the localized strings object.
 * @param {string} component - The name of the component to load translations for.
 * @param {Record<string, Partial<T>>} [overrides] - Optional translation overrides keyed by language codes.
 *
 * @returns {(key: string) => string | undefined}
 *   A function to look up localized strings by key.
 *
 * @example
 * ```tsx
 * const t = useI18n<{ title: string, description: string }>('Header', {
 *   en: { title: "Hello" }
 * });
 * return <h1>{t('title')}</h1>;
 * ```
 */
export function useI18n<T extends object>(
  component: string,
  overrides?: Record<string, Partial<T>>,
): (key: string, vars?: Record<string, unknown>) => string | undefined {
  const { config } = useComponentConfig();
  const lang = config.i18n?.currentLanguage;
  const fallback = config.i18n?.fallbackLanguage;

  const [tFunction, setTFunction] = useState<
    ((key: string, vars?: Record<string, unknown>) => string | undefined) | undefined
  >(undefined);

  useEffect(() => {
    if (!lang || !component) {
      setTFunction(() => () => undefined);
      return;
    }

    const load = async () => {
      try {
        const t = await getLocalizedComponentAsync<T>(lang, component, fallback ?? 'en', overrides);
        setTFunction(() => t ?? (() => undefined));
      } catch (error) {
        console.error('[useI18n] Error loading localized strings:', error);
        setTFunction(() => () => undefined);
      }
    };

    load();
  }, [lang, component, fallback]);

  return tFunction ?? (() => undefined);
}
