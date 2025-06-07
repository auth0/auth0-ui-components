import type { LangTranslations } from './types';

const translationsMap: Record<string, () => Promise<{ default: LangTranslations }>> = {
  en: () => import('./translations/en.json'),
  // Add other supported languages here
};

const cache = new Map<string, LangTranslations | null>();
const pendingLoads = new Map<string, Promise<LangTranslations | null>>();

/**
 * Dynamically loads and caches a language JSON file.
 *
 * @param {string} code - Language code to load (e.g. 'en-US')
 * @returns {Promise<LangTranslations | null>}
 */
async function loadLangFile(code: string): Promise<LangTranslations | null> {
  if (cache.has(code)) return cache.get(code)!;
  if (pendingLoads.has(code)) return pendingLoads.get(code)!;

  const loadPromise = (async () => {
    try {
      const importer = translationsMap[code];
      if (!importer) {
        cache.set(code, null);
        return null;
      }

      const mod = await importer();
      const data = mod.default ?? mod;
      cache.set(code, data);
      return data;
    } catch (err) {
      console.error(`[loadLangFile] Failed to load "${code}":`, err);
      cache.set(code, null);
      return null;
    } finally {
      pendingLoads.delete(code);
    }
  })();

  pendingLoads.set(code, loadPromise);
  return loadPromise;
}

/**
 * Extracts the base language code from a full language code.
 * E.g. 'en-US' => 'en'
 *
 * @param {string} langCode - The full language code
 * @returns {string} The base language code
 */
function getBaseLang(langCode: string): string {
  return langCode.split('-')[0];
}

/**
 * Loads translations for a given language with fallback logic.
 * Tries the full language code first, then the base language code.
 *
 * @param {string} langCode - Language code to load
 * @returns {Promise<{ data: LangTranslations; usedLang: string } | null>} Loaded translations and the code used or null
 */
async function tryLoadWithFallbacks(
  langCode: string,
): Promise<{ data: LangTranslations; usedLang: string } | null> {
  const baseLang = getBaseLang(langCode);

  const data = await loadLangFile(langCode);
  if (data) return { data, usedLang: langCode };

  if (baseLang !== langCode) {
    const baseData = await loadLangFile(baseLang);
    if (baseData) return { data: baseData, usedLang: baseLang };
  }

  return null;
}

/**
 * Safely retrieves a nested string value from an object given a dot-separated path.
 * Returns `undefined` if any key is missing or final value is not a string.
 *
 * @param obj - The object to query.
 * @param path - Dot-separated path to the nested property.
 * @returns The string value at the path or undefined.
 */
function getNestedValue<T extends object>(obj: T, path: string): string | undefined {
  const keys = path.split('.');

  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Asynchronously fetches localized strings for a given component and language,
 * supports fallback language and optional overrides,
 * and returns a lookup function `t(key)` to retrieve nested localized strings.
 *
 * @template T - Shape of component translations
 * @param lang Requested language code (e.g., 'en-US')
 * @param component Component name (e.g., 'Header')
 * @param fallbackLang Fallback language code (default 'en')
 * @param overrides Optional overrides keyed by language code
 *
 * @returns Promise of a function `t(key)` returning localized string or undefined, or undefined if missing.
 */
export async function getLocalizedComponentAsync<T = unknown>(
  lang: string,
  component: string,
  fallbackLang = 'en',
  overrides?: Record<string, Partial<T>>,
): Promise<((key: string) => string | undefined) | undefined> {
  try {
    const langResult = await tryLoadWithFallbacks(lang);
    const fallbackResult = langResult ?? (await tryLoadWithFallbacks(fallbackLang));

    if (!fallbackResult) {
      console.warn(
        `[getLocalizedComponentAsync] No translations found for "${lang}" or fallback "${fallbackLang}".`,
      );
      return undefined;
    }

    const { data: langData, usedLang } = fallbackResult;
    const componentData = langData[component] as T | undefined;

    if (!componentData) {
      console.warn(
        `[getLocalizedComponentAsync] Component "${component}" missing in language "${usedLang}".`,
      );
      return undefined;
    }

    // Merge overrides if present
    const mergedData = {
      ...componentData,
      ...overrides?.[usedLang],
    };

    // Return the lookup function t(key)
    return (key: string, vars?: Record<string, unknown>): string | undefined => {
      const val = getNestedValue(mergedData, key);
      if (typeof val !== 'string') return undefined;

      return val.replace(/\$\{(\w+)\}/g, (_, varName) =>
        vars?.[varName] != null ? String(vars[varName]) : '',
      );
    };
  } catch (error) {
    console.error('[getLocalizedComponentAsync] Unexpected error:', error);
    return undefined;
  }
}
