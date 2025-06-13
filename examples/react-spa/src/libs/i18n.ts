import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../locales/en.json';
import jaTranslations from '../locales/ja.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    'en-US': {
      translation: enTranslations,
    },
    ja: {
      translation: jaTranslations,
    },
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

export default i18n;
