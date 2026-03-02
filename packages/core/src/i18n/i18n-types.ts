/**
 * Type definitions for the internationalization system.
 * @module i18n-types
 * @internal
 */

/**
 * Represents a component placeholder that will be replaced by the consuming framework.
 * In React apps, this would be ReactElement. In other frameworks, it could be different.
 * @internal
 */
export type TransComponent = unknown;

/**
 * Function type for creating components from translation content.
 * Takes the translated text content and returns a component representation.
 * The actual implementation depends on the consuming framework.
 * @internal
 *
 * @param children - The translated text content to wrap in the component
 * @returns A component representation (framework-specific)
 *
 * @example
 * ```typescript
 * // In React implementation:
 * const linkComponent: TransComponentFunction = (children) =>
 *   React.createElement('a', { href: '/help' }, children);
 *
 * // In Vue implementation:
 * const linkComponent: TransComponentFunction = (children) =>
 *   h('a', { href: '/help' }, children);
 * ```
 */
export type TransComponentFunction = (children: string) => TransComponent;

/**
 * Mapping of component keys to component representations or component functions.
 * Used in translation strings with component placeholders like <link>text</link>.
 * Framework-agnostic - the actual component type depends on the implementation.
 * @internal
 *
 * @example
 * ```typescript
 * const components: TranslationElements = {
 *   link: (children) => createLinkComponent(children),
 *   strong: (children) => createStrongComponent(children),
 *   button: createButtonComponent()
 * };
 * ```
 */
export type TranslationElements = Record<string, TransComponent | TransComponentFunction>;

/**
 * Basic translation function that returns a translated string.
 * @internal
 *
 * @param key - The translation key (without namespace prefix)
 * @param vars - Optional variables for string interpolation
 * @param fallback - Optional fallback text if translation is not found
 * @returns The translated string with variables substituted
 */
export type TranslationFunction = (
  key: string,
  vars?: Record<string, unknown>,
  fallback?: string,
) => string;

/**
 * Enhanced translation function with Trans component support.
 * Extends the basic translation function with a `trans` method for safe component rendering.
 * Framework-agnostic - works with any UI framework.
 * @internal
 */
export type EnhancedTranslationFunction = TranslationFunction & {
  /**
   * Renders a translation with framework components for safe HTML-like content.
   * Returns an array of strings and framework-specific components.
   *
   * @param key - The translation key
   * @param options - Configuration options for component rendering
   * @param options.components - Mapping of component keys to framework elements
   * @param options.vars - Variables for string interpolation
   * @param options.fallback - Fallback text if translation is not found
   * @returns Array of strings and framework components for safe rendering
   *
   * @example
   * ```typescript
   * // Framework-agnostic usage
   * const elements = t.trans('help.message', {
   *   components: {
   *     link: (children) => createLinkComponent(children)
   *   },
   *   vars: { name: 'John' }
   * });
   *
   * // Result: ['Hello ', LinkComponent, ', click here for help.']
   * ```
   */
  trans: (
    key: string,
    options?: {
      components?: TranslationElements;
      vars?: Record<string, unknown>;
      fallback?: string;
    },
  ) => (string | TransComponent)[];
};

/**
 * Factory function type for creating translation functions.
 * @internal
 *
 * @param namespace - The namespace for translations
 * @param overrides - Optional override translations
 * @returns A translation function scoped to the namespace
 */
export type TFactory = (
  namespace: string,
  overrides?: Record<string, unknown>,
) => EnhancedTranslationFunction;

/**
 * Language-specific translation data structure.
 * Nested object containing all translations for a specific language.
 * @internal
 */
export type LangTranslations = Record<string, unknown>;

/**
 * Configuration options for initializing the i18n service.
 * @internal
 */
export interface I18nInitOptions {
  /** The current/preferred language code (e.g., 'en-US', 'es-ES') */
  currentLanguage?: string;
  /** The fallback language code if current language fails to load */
  fallbackLanguage?: string;
}

/**
 * Main interface for the i18n service providing translation management capabilities.
 * Framework-agnostic core functionality.
 * @internal
 */
export interface I18nServiceInterface {
  /** Current active language code */
  currentLanguage: string;

  /** Fallback language code */
  fallbackLanguage: string | undefined;

  /** Factory for creating namespace-scoped translation functions */
  translator: TFactory;

  /** Pre-configured translator for common translations */
  commonTranslator: EnhancedTranslationFunction;

  /**
   * Gets the currently loaded translation data.
   * @returns The translation data or null if not loaded
   */
  getCurrentTranslations(): LangTranslations | null;

  /**
   * Changes the active language and reloads translations.
   * @param language - The new language code to switch to
   * @param newFallbackLanguage - Optional new fallback language
   */
  changeLanguage(language: string, newFallbackLanguage?: string): Promise<void>;
}
