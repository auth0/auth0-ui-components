import { I18nInstance, LangTranslations, TranslationFunction } from './types';

/**
 * Creates and initializes an internationalization (i18n) instance with optimized
 * caching and namespace support.
 *
 * Features:
 * - Namespace-based translation organization
 * - Multi-level language fallback
 * - Variable substitution with ${varName} syntax
 * - Local overrides per component
 * - Efficient caching
 */

export async function createI18n(options: {
  currentLanguage: string;
  fallbackLanguage?: string;
}): Promise<I18nInstance> {
  // Optimized caching
  const cache = new Map<string, LangTranslations | null>();
  let translations: LangTranslations | null = null;

  // Regex compile once
  const varRegex = /\${(\w+)}/g;
  const hasVars = (str: string): boolean => varRegex.test(str);

  /**
   * Gets nested value from object using dot notation
   */
  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce<unknown>((value, key) => {
      if (value == null) return undefined;
      if (typeof value !== 'object') return undefined;
      return (value as Record<string, unknown>)[key];
    }, obj);
  };

  // Efficient variable substitution
  const substitute = (str: string, vars?: Record<string, unknown>): string => {
    if (!vars || !hasVars(str)) return str;
    varRegex.lastIndex = 0; // Reset regex
    return str.replace(varRegex, (_, key) => String(vars[key] ?? ''));
  };

  // Optimized file loading with request deduplication
  const loadTranslations = async (lang: string): Promise<LangTranslations | null> => {
    const cached = cache.get(lang);
    if (cached !== undefined) return cached;

    try {
      const mod = await import(`./translations/${lang}.json`);
      const data = mod.default ?? mod;
      cache.set(lang, data);
      return data;
    } catch {
      cache.set(lang, null);
      return null;
    }
  };

  /**
   * Loads translations with fallback strategy:
   * 1. Try current language
   * 2. Try user-specified fallback
   * 3. Try en-US as default fallback
   */
  const loadTranslationsWithFallback = async (
    currentLang: string,
    fallbackLang?: string,
  ): Promise<LangTranslations | null> => {
    // Try current language
    const currentTranslations = await loadTranslations(currentLang);
    if (currentTranslations) return currentTranslations;

    // Try user fallback if specified and different from current
    if (fallbackLang && fallbackLang !== currentLang) {
      const fallbackTranslations = await loadTranslations(fallbackLang);
      if (fallbackTranslations) return fallbackTranslations;
    }

    // Try en-US as last resort if not already tried
    if (currentLang !== 'en-US' && fallbackLang !== 'en-US') {
      return await loadTranslations('en-US');
    }

    return null;
  };

  translations = await loadTranslationsWithFallback(
    options.currentLanguage,
    options.fallbackLanguage,
  );

  // Optimized translator factory with string concatenation optimization
  const createTranslator = (namespace: string): TranslationFunction => {
    const prefix = `${namespace}.`;

    return (
      key: string,
      vars?: Record<string, unknown>,
      overrides?: Record<string, unknown>,
    ): string => {
      if (!translations) return prefix + key;

      const fullKey = prefix + key;
      const defaultValue = getNestedValue(translations, fullKey);
      const value = overrides?.[key] ?? defaultValue ?? key;

      return vars ? substitute(String(value), vars) : String(value);
    };
  };

  return { t: createTranslator };
}
