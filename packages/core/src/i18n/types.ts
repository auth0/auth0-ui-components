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
 * A function that performs string translation within a specific namespace.
 * Returns the translated string or the key itself as a fallback.
 *
 * @param key - Translation key relative to the current namespace (e.g., "buttons.submit")
 * @param vars - Optional variables for string interpolation (e.g., { name: "John" })
 * @returns Translated string with interpolated variables, or the key if translation is missing
 *
 * @example
 * const translate = getTranslator("forms");
 * translate("submit.button", { action: "Save" }); // => "Save changes"
 */
export type TranslationFunction = (key: string, vars?: Record<string, unknown>) => string;

/**
 * Factory function that creates namespace-scoped translation functions.
 * Used to organize translations into logical groups and avoid key conflicts.
 *
 * @param namespace - Translation namespace (e.g., "common", "auth", "forms")
 * @returns A translation function scoped to the specified namespace
 *
 * @example
 * const t = factory("auth");
 * t("login.title"); // Looks up "auth.login.title" in translations
 */
export type TFactory = (namespace: string) => TranslationFunction;

/**
 * Interface representing an initialized i18n instance.
 * Provides access to the translation factory function for creating
 * namespace-scoped translators.
 *
 * @property t - Factory function for creating namespace-scoped translators
 *
 * @example
 * const i18n: I18nInstance = await createI18n({ currentLanguage: "en" });
 * const t = i18n.t("common");
 * t("welcome"); // => "Welcome"
 */
export interface I18nInstance {
  t: TFactory;
}
