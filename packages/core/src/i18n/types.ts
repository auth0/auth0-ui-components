/**
 * Type representing the translations for a single component.
 * Maps translation keys to translated strings.
 */
export type ComponentTranslations = Record<string, string>;

/**
 * Type representing all translations for a language.
 * Maps component names to their translations.
 */
export type LangTranslations = {
  [key: string]: string | LangTranslations;
};
