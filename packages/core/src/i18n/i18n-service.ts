import { LangTranslations, TranslationFunction, I18nInitOptions } from './types';

// These variables manage the singleton i18n instance.
let _translations: LangTranslations | null = null;
let _cache: Map<string, LangTranslations | null> = new Map(); // Initialize cache directly
let _currentLanguage: string = 'en-US'; // Track current language
let _fallbackLanguage: string | undefined; // Track fallback language

const VAR_REGEX = /\${(\w+)}/g;

/**
 * Recursively gets a nested value from an object using dot notation.
 * Optimized with early returns and reduced type checks.
 */
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  let current: unknown = obj;
  const keys = path.split('.');

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
};

/**
 * Efficiently substitutes variables in a string.
 * Optimized with early variable detection and regex reuse.
 */
const substitute = (str: string, vars?: Record<string, unknown>): string => {
  if (!vars) return str;

  // Quick check for variables before expensive regex operation
  if (!str.includes('${')) return str;

  VAR_REGEX.lastIndex = 0;
  return str.replace(VAR_REGEX, (_, key) => String(vars[key] ?? ''));
};

/**
 * Loads translation data for a specific language with optimized caching.
 */
const loadTranslations = async (lang: string): Promise<LangTranslations | null> => {
  if (_cache.has(lang)) {
    return _cache.get(lang)!;
  }

  try {
    const mod = await import(`./translations/${lang}.json`);
    const data = mod.default ?? mod;
    _cache.set(lang, data);
    return data;
  } catch {
    _cache.set(lang, null);
    return null;
  }
};

/**
 * Optimized fallback loading with early returns.
 */
const loadTranslationsWithFallback = async (
  currentLang: string,
  fallbackLang?: string,
): Promise<LangTranslations | null> => {
  // 1. Try current language
  let result = await loadTranslations(currentLang);
  if (result) return result;

  // 2. Try fallback if different from current
  if (fallbackLang && fallbackLang !== currentLang) {
    result = await loadTranslations(fallbackLang);
    if (result) return result;
  }

  // 3. Try 'en-US' as a last resort if not already tried
  if (currentLang !== 'en-US' && fallbackLang !== 'en-US') {
    return loadTranslations('en-US');
  }

  return null;
};

// --- Public API Functions ---

/**
 * Initializes or changes the language of the global i18n instance.
 */
export async function initializeI18n(options: I18nInitOptions = {}): Promise<void> {
  const currentLanguage = options?.currentLanguage ?? 'en-US';
  const { fallbackLanguage } = options;

  // Update current settings
  _currentLanguage = currentLanguage;
  _fallbackLanguage = fallbackLanguage;

  // Load translations
  const result = await loadTranslationsWithFallback(currentLanguage, fallbackLanguage);
  _translations = result;
}

/**
 * Gets the current language being used.
 */
export function getCurrentLanguage(): string {
  return _currentLanguage;
}

/**
 * Gets the current fallback language being used.
 */
export function getFallbackLanguage(): string | undefined {
  return _fallbackLanguage;
}

/**
 * Gets the current translations object.
 */
export function getCurrentTranslations(): LangTranslations | null {
  return _translations;
}

/**
 * Creates a namespace-scoped translation function with optimized performance.
 */
export function createTranslator(
  namespace: string,
  overrides?: Record<string, unknown>,
): TranslationFunction {
  const prefix = `${namespace}.`;
  const hasOverrides = overrides && Object.keys(overrides).length > 0;

  return (
    key: string,
    vars?: Record<string, unknown>,
    localOverrides?: Record<string, unknown>,
  ): string => {
    // Optimize override handling
    let mergedOverrides: Record<string, unknown> | undefined;

    if (localOverrides || hasOverrides) {
      mergedOverrides = hasOverrides ? { ...overrides, ...localOverrides } : localOverrides;

      const overrideValue = getNestedValue(mergedOverrides!, key);
      if (overrideValue !== undefined) {
        return substitute(String(overrideValue), vars);
      }
    }

    // Early return if translations not loaded
    if (!_translations) {
      return `${prefix}${key}`;
    }

    // Get translation value
    const fullKey = prefix + key;
    const translationValue = getNestedValue(_translations, fullKey);
    const finalValue = translationValue !== undefined ? String(translationValue) : key;

    return substitute(finalValue, vars);
  };
}
