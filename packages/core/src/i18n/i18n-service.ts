import { LangTranslations, TranslationFunction, I18nInitOptions } from './types';

// These variables manage the singleton i18n instance.
let _translations: LangTranslations | null = null;
let _cache: Map<string, LangTranslations | null> = new Map(); // Initialize cache directly
let _isInitializedPromise: Promise<void> | null = null; // Promise to track initialization status
let _isInitializedSync = false; // Synchronous flag for quick checks

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
  // Use Map.has() for explicit cache checking
  if (_cache.has(lang)) {
    return _cache.get(lang)!;
  }

  try {
    const mod = await import(`./translations/${lang}.json`);
    const data = mod.default ?? mod;
    _cache.set(lang, data);
    return data;
  } catch {
    // Simplified error handling - no console.warn for performance
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
 * Initializes the global i18n instance with optimized error handling.
 */
export function initializeI18n(options: I18nInitOptions = {}): Promise<void> {
  if (_isInitializedPromise) {
    return _isInitializedPromise;
  }

  const currentLanguage = options?.currentLanguage ?? 'en-US';
  const { fallbackLanguage } = options;

  _isInitializedPromise = loadTranslationsWithFallback(currentLanguage, fallbackLanguage)
    .then((result) => {
      _translations = result;
      _isInitializedSync = true;
    })
    .catch((error) => {
      _translations = null;
      _isInitializedSync = true;
      throw error;
    });

  return _isInitializedPromise;
}

/**
 * Synchronously checks if the i18n instance is ready.
 */
export function isI18nReady(): boolean {
  return _isInitializedSync;
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
