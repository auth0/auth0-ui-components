import * as React from 'react';
import { useI18n } from '@/providers/I18nProvider';
import type { 
  TranslationMap, 
  LanguageCode, 
  Translator 
} from '@auth0-ui-components/core';

/**
 * Parameters for the useTranslations hook
 * @property {string} namespace - Unique identifier for the translation group (e.g., 'login', 'mfa')
 * @property {Record<LanguageCode, TranslationMap>} translations - Translation key-value pairs by language
 * @property {(error: Error) => void} [onError] - Optional error handler callback
 * 
 * @example
 * ```ts
 * {
 *   namespace: 'login',
 *   translations: {
 *     en: { title: 'Sign In' },
 *     es: { title: 'Iniciar Sesión' }
 *   },
 *   onError: (error) => console.error('Translation error:', error)
 * }
 * ```
 */
interface UseTranslationsParams {
  namespace: string;
  translations: Record<LanguageCode, TranslationMap>;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing component-level translations
 * Registers translations with the I18n service and returns a translator instance
 * 
 * @param {UseTranslationsParams} params - Translation configuration and error handling
 * @returns {Translator} A translator instance for the specified namespace
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { t } = useTranslations({
 *     namespace: 'login',
 *     translations: {
 *       en: { title: 'Sign In' }
 *     }
 *   });
 * 
 *   return <button>{t('title')}</button>;
 * }
 * ```
 */
export function useTranslations({
  namespace,
  translations,
  onError,
}: UseTranslationsParams): Translator {
  // Get I18n service from context
  const i18n = useI18n();

  // Register translations when dependencies change
  React.useEffect(() => {
    // Validate required namespace
    if (!namespace) {
      onError?.(new Error('Namespace is required for translations'));
      return;
    }

    // Only add translations if they exist and are not empty
    if (translations && Object.keys(translations).length > 0) {
      try {
        // Register translations with I18n service
        i18n.addTranslations(namespace, translations);
      } catch (error) {
        // Handle registration errors
        onError?.(
          error instanceof Error 
            ? error 
            : new Error('Failed to add translations')
        );
      }
    }
  }, [namespace, translations, i18n, onError]);

  // Return memoized translator to prevent unnecessary recreations
  return React.useMemo(
    () => i18n.useNamespace(namespace),
    [namespace, i18n]
  );
}