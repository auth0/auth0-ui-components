import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createI18nService, I18nUtils } from '../i18n-service';

describe('createI18nService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('translation resolution order', () => {
    it('should use user translations for currentLanguage first', async () => {
      const userTranslations = {
        'en-US': {
          common: { copy: 'User Copy' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'en-US',
        translations: userTranslations,
      });

      const t = service.translator('common');
      expect(t('copy')).toBe('User Copy');
    });

    it('should fall back to user translations for fallbackLanguage', async () => {
      const userTranslations = {
        'es-ES': {
          common: { copy: 'Copiar del usuario' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'fr-FR',
        fallbackLanguage: 'es-ES',
        translations: userTranslations,
      });

      const t = service.translator('common');
      expect(t('copy')).toBe('Copiar del usuario');
    });

    it('should fall back to bundled translations when no user translations provided', async () => {
      const service = await createI18nService({
        currentLanguage: 'en-US',
      });

      const t = service.translator('common');
      expect(t('copy')).toBe('Copy');
    });

    it('should fall back to bundled translations when user translations do not have current or fallback language', async () => {
      const userTranslations = {
        'de-DE': {
          common: { copy: 'Kopieren' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
        translations: userTranslations,
      });

      const t = service.translator('common');
      expect(t('copy')).toBe('Copy');
    });
  });

  describe('changeLanguage', () => {
    it('should use user translations after language change', async () => {
      const userTranslations = {
        'en-US': {
          common: { copy: 'Copy EN' },
        },
        'es-ES': {
          common: { copy: 'Copiar ES' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'en-US',
        translations: userTranslations,
      });

      expect(service.translator('common')('copy')).toBe('Copy EN');

      await service.changeLanguage('es-ES');
      expect(service.translator('common')('copy')).toBe('Copiar ES');
    });

    it('should fall back to user fallback language translations if user translations missing for new language', async () => {
      const userTranslations = {
        'en-US': {
          common: { copy: 'User Copy EN' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
        translations: userTranslations,
      });

      expect(service.translator('common')('copy')).toBe('User Copy EN');

      // Change to fr-FR (no user translations) - falls back to user's en-US (fallbackLanguage)
      await service.changeLanguage('fr-FR');
      expect(service.translator('common')('copy')).toBe('User Copy EN');
    });

    it('should fall back to bundled translations when no user translations for current or fallback language', async () => {
      const userTranslations = {
        'de-DE': {
          common: { copy: 'Kopieren' },
        },
      };

      const service = await createI18nService({
        currentLanguage: 'de-DE',
        fallbackLanguage: 'de-DE',
        translations: userTranslations,
      });

      expect(service.translator('common')('copy')).toBe('Kopieren');

      // Change to fr-FR with fallback to es-ES - neither has user translations, falls back to bundled
      await service.changeLanguage('fr-FR', 'es-ES');
      expect(service.translator('common')('copy')).toBe('Copy');
    });
  });
});

describe('I18nUtils', () => {
  describe('loadTranslationsWithFallback', () => {
    it('should return current language translations if available', async () => {
      const cache = new Map();
      const result = await I18nUtils.loadTranslationsWithFallback('en-US', 'en-US', cache);
      expect(result).toBeDefined();
      expect((result as Record<string, Record<string, string>>)?.common?.copy).toBe('Copy');
    });

    it('should fall back to en-US if current language not available', async () => {
      const cache = new Map();
      // fr-FR doesn't exist, should fall back to en-US
      const result = await I18nUtils.loadTranslationsWithFallback('fr-FR', 'en-US', cache);
      expect(result).toBeDefined();
      expect((result as Record<string, Record<string, string>>)?.common?.copy).toBe('Copy');
    });

    it('should fall back to en-US if neither current nor fallback available', async () => {
      const cache = new Map();
      const result = await I18nUtils.loadTranslationsWithFallback('fr-FR', 'de-DE', cache);
      expect(result).toBeDefined();
      expect((result as Record<string, Record<string, string>>)?.common?.copy).toBe('Copy');
    });
  });
});
