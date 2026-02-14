import { type EnhancedTranslationFunction } from '@auth0/universal-components-core';
import { useMemo, useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';

/**
 * Custom hook for accessing the i18n service from CoreClient.
 *
 * This hook provides access to the i18n service from the CoreClient context,
 * including enhanced translation functions with Trans component support and language change capabilities.
 *
 * @param namespace - The translation namespace (e.g., 'mfa', 'common')
 * @param overrides - Optional translation overrides for the namespace
 * @returns An object containing the enhanced translator function and changeLanguage function
 *
 * @example
 * ```tsx
 * // Basic usage with namespace only
 * const { t, changeLanguage } = useTranslator('common');
 *
 * // Usage with overrides
 * const { t } = useTranslator('mfa', {
 *   title: 'Custom Title',
 *   'sms.title': 'Text Message'
 * });
 *
 * // Using the basic translator
 * const title = t('title');
 * const message = t('welcome', { name: 'John' });
 *
 * // Using the trans method for safe HTML rendering
 * const elements = t.trans('help.message', {
 *   components: {
 *     link: (children) => <a href="/help" target="_blank">{children}</a>,
 *     strong: (children) => <strong>{children}</strong>
 *   },
 *   vars: { name: 'John' }
 * });
 *
 * // Render the elements
 * return (
 *   <div>
 *     {elements.map((element, index) => (
 *       <Fragment key={index}>{element}</Fragment>
 *     ))}
 *   </div>
 * );
 *
 * // Changing language
 * await changeLanguage('es-ES');
 * ```
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
