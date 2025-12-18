import type {
  I18nServiceInterface,
  TranslationElements,
  EnhancedTranslationFunction,
} from '../i18n-types';

/**
 * Creates a mock translator function with trans support
 */
const createMockTranslator = (
  _namespace: string,
  customMessages?: Record<string, unknown>,
): EnhancedTranslationFunction => {
  const translationFn = (key: string, _vars?: Record<string, unknown>, fallback?: string) => {
    if (customMessages) {
      // Simplified nested value getter for mocks
      const keys = key.split('.');
      let value: unknown = customMessages;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) {
        return String(value);
      }
    }
    return fallback || key;
  };

  const enhancedFn = translationFn as EnhancedTranslationFunction;

  enhancedFn.trans = (
    key: string,
    _options?: {
      components?: TranslationElements;
      vars?: Record<string, unknown>;
      fallback?: string;
    },
  ) => {
    return [translationFn(key, _options?.vars, _options?.fallback)];
  };

  return enhancedFn;
};

/**
 * Creates a mock I18nServiceInterface
 */
export const createMockI18nService = (
  overrides?: Partial<I18nServiceInterface>,
): I18nServiceInterface => ({
  currentLanguage: 'en',
  fallbackLanguage: 'en',
  translator: (namespace: string, customMessages?: Record<string, unknown>) =>
    createMockTranslator(namespace, customMessages),
  get commonTranslator() {
    return createMockTranslator('common');
  },
  getCurrentTranslations: () => null,
  changeLanguage: async () => {},
  ...overrides,
});
