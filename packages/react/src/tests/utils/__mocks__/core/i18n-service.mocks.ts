import type { I18nServiceInterface } from '@auth0/universal-components-core';
import { I18nUtils } from '@auth0/universal-components-core';

const createMockTranslator = (_namespace: string, customMessages?: Record<string, unknown>) => {
  const translationFn = (key: string) => {
    if (customMessages) {
      const override = I18nUtils.getNestedValue(customMessages, key);
      if (override) {
        return String(override);
      }
    }
    return key;
  };

  translationFn.trans = (key: string, options?: { components?: Record<string, unknown> }) => {
    const link = options?.components?.link;
    if (typeof link === 'function') {
      return [(link as (children: string) => unknown)(translationFn(key))];
    }
    return [translationFn(key)];
  };

  return translationFn;
};

export const createMockI18nService = (): I18nServiceInterface => ({
  currentLanguage: 'en',
  fallbackLanguage: 'en',
  translator: (namespace, customMessages) => createMockTranslator(namespace, customMessages),
  get commonTranslator() {
    return createMockTranslator('common');
  },
  getCurrentTranslations: () => null,
  changeLanguage: async () => {},
});
