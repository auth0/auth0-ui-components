/**
 * i18n translator hook.
 * @module use-translator
 */

import { type EnhancedTranslationFunction } from '@auth0/universal-components-core';
import { useMemo, useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';

/**
 * Hook to access i18n translations.
 * @param namespace - Translation namespace.
 * @param overrides - Optional translation overrides.
 * @returns Translator function and language utilities.
 */
export function useTranslator(
  namespace: string,
  overrides?: Record<string, unknown>,
): {
  t: EnhancedTranslationFunction;
  changeLanguage: (language: string, fallbackLanguage?: string) => Promise<void>;
  currentLanguage: string;
  fallbackLanguage: string | undefined;
} {
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(
      'useTranslator must be used within Auth0ComponentProvider with initialized CoreClient',
    );
  }

  const translator = useMemo(() => {
    return coreClient.i18nService.translator(namespace, overrides);
  }, [coreClient, namespace, overrides]);

  const changeLanguage = useCallback(
    async (language: string, fallbackLanguage?: string) => {
      await coreClient.i18nService.changeLanguage(language, fallbackLanguage);
    },
    [coreClient],
  );

  return {
    t: translator,
    changeLanguage,
    currentLanguage: coreClient.i18nService.currentLanguage,
    fallbackLanguage: coreClient.i18nService.fallbackLanguage,
  };
}
