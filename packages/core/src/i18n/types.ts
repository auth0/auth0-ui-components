/**
 * Represents a node within the translation JSON structure.
 * It can be either a final translation string or a nested object
 * containing more translation nodes.
 */
export type TranslationNode = string | { [key: string]: TranslationNode };

/**
 * Represents the top-level structure of a loaded translation file.
 * This is the most specific and type-safe way to define a
 * deeply nested object of translations.
 */
export type LangTranslations = {
  [key: string]: TranslationNode;
};

/**
 * Configuration options for initializing the i18n instance.
 */
export interface I18nInitOptions {
  /** The primary language to load and use (e.g., 'en-US', 'es-ES'). */
  currentLanguage?: string;
  /** An optional fallback language to use if a translation is not found in the current language. */
  fallbackLanguage?: string;
}

/**
 * A function that performs string translation within a specific namespace.
 * Returns the translated string or the key itself as a fallback.
 *
 * @param key - Translation key relative to the current namespace (e.g., "buttons.submit")
 * @param vars - Optional variables for string interpolation (e.g., { name: "John" })
 * @param overrides - Optional translation overrides for local customization
 * @returns Translated string with interpolated variables, or the key if translation is missing
 */
export type TranslationFunction = (
  key: string,
  vars?: Record<string, unknown>,
  overrides?: Record<string, unknown>,
) => string;
