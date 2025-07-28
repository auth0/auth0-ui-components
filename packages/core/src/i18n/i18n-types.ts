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
 * Translation function that returns localized text for a given key.
 * Supports variable substitution and fallback text.
 */
export type TranslationFunction = (
  key: string,
  vars?: Record<string, unknown>,
  fallback?: string,
) => string;

/**
 * Factory function that creates namespace-scoped translation functions.
 *
 * @param namespace - Translation namespace (e.g., "mfa", "login")
 * @param overrides - Optional translation overrides for the namespace
 */
export type TFactory = (
  namespace: string,
  overrides?: Record<string, unknown>,
) => TranslationFunction;

/**
 * Interface for the I18nService class.
 */
export interface I18nServiceInterface {
  currentLanguage: string;
  fallbackLanguage: string | undefined;
  translator: TFactory;
  commonTranslator: TranslationFunction;
  getCurrentTranslations(): LangTranslations | null;
  changeLanguage(language: string, fallbackLanguage?: string): Promise<void>;
}
